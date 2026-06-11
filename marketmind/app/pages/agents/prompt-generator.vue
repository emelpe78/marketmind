<script setup lang="ts">
import type { PromptLibraryEntry } from "~/composables/useAgents";
import { formatDateTime } from "shared/format-datetime";
import {
  agentNameById,
  buildAssignableAgentOptions,
  findAssignedPromptForAgent,
  PROMPT_ASSIGNMENT_HINT,
} from "shared/prompt-library-agents";

definePageMeta({ layout: "default" });

usePageHead(
  "System-Prompt-Generator",
  "Neue System-Prompts per KI erstellen und in der Bibliothek ablegen",
);

const {
  agents,
  prompts,
  loading,
  generatePrompt: runGeneratePrompt,
  savePromptToLibrary: persistPromptToLibrary,
  updatePromptLibrary,
  deletePromptLibrary,
} = await useAgents();

const promptDescription = ref("");
const generatedPrompt = ref("");
const viewingPrompt = ref<PromptLibraryEntry | null>(null);
const editingPrompt = ref<PromptLibraryEntry | null>(null);
const deletingPrompt = ref<PromptLibraryEntry | null>(null);
const assigningPromptId = ref<number | null>(null);
const toast = useToast();

const agentOptions = computed(() =>
  buildAssignableAgentOptions(agents.value ?? []),
);

const editingWouldReplace = computed(() => {
  const entry = editingPrompt.value;
  if (!entry?.agent_id) return undefined;
  return findAssignedPromptForAgent(
    prompts.value ?? [],
    entry.agent_id,
    entry.id,
  );
});

const viewModalOpen = computed({
  get: () => viewingPrompt.value !== null,
  set: (open: boolean) => {
    if (!open) viewingPrompt.value = null;
  },
});
const editModalOpen = computed({
  get: () => editingPrompt.value !== null,
  set: (open: boolean) => {
    if (!open) editingPrompt.value = null;
  },
});
const deleteModalOpen = computed({
  get: () => deletingPrompt.value !== null,
  set: (open: boolean) => {
    if (!open) deletingPrompt.value = null;
  },
});

function normalizeAgentId(value: unknown): number | null {
  if (value == null || value === "") return null;
  const id = Number(value);
  return Number.isFinite(id) ? id : null;
}

async function generatePrompt() {
  if (!promptDescription.value) return;
  try {
    const result = await runGeneratePrompt(promptDescription.value);
    generatedPrompt.value = result.prompt;
  } catch {
    toast.add({ title: "Prompt-Generierung fehlgeschlagen", color: "error" });
  }
}

async function savePromptToLibrary() {
  if (!generatedPrompt.value) return;
  try {
    await persistPromptToLibrary(
      promptDescription.value.slice(0, 50),
      generatedPrompt.value,
    );
    toast.add({ title: "In Bibliothek gespeichert", color: "success" });
    generatedPrompt.value = "";
  } catch {
    toast.add({ title: "Speichern fehlgeschlagen", color: "error" });
  }
}

function openViewModal(entry: PromptLibraryEntry) {
  viewingPrompt.value = { ...entry, agent_id: entry.agent_id ?? null };
}

function openEditModal(entry: PromptLibraryEntry) {
  editingPrompt.value = { ...entry, agent_id: entry.agent_id ?? null };
}

function openDeleteModal(entry: PromptLibraryEntry) {
  deletingPrompt.value = entry;
}

function notifyAssignmentResult(
  agentId: number | null,
  replaced?: { name: string },
) {
  if (agentId == null) return;

  if (replaced) {
    toast.add({
      title: "Zuordnung ersetzt",
      description: `„${replaced.name}" ist nicht mehr ${agentNameById(agents.value ?? [], agentId)} zugeordnet.`,
      color: "warning",
    });
    return;
  }

  toast.add({ title: "Agent-Zuordnung gespeichert", color: "success" });
}

async function assignAgent(
  entry: PromptLibraryEntry,
  agentId: number | null,
  options?: { notify?: boolean },
) {
  const replaced =
    agentId != null
      ? findAssignedPromptForAgent(prompts.value ?? [], agentId, entry.id)
      : undefined;

  assigningPromptId.value = entry.id;
  try {
    await updatePromptLibrary({
      ...entry,
      agent_id: agentId,
    });
    if (viewingPrompt.value?.id === entry.id) {
      viewingPrompt.value = { ...viewingPrompt.value, agent_id: agentId };
    }
    if (options?.notify) {
      notifyAssignmentResult(agentId, replaced);
    }
  } catch {
    toast.add({ title: "Zuordnung fehlgeschlagen", color: "error" });
  } finally {
    assigningPromptId.value = null;
  }
}

async function saveEdit() {
  if (!editingPrompt.value) return;
  const replaced =
    editingPrompt.value.agent_id != null
      ? findAssignedPromptForAgent(
          prompts.value ?? [],
          editingPrompt.value.agent_id,
          editingPrompt.value.id,
        )
      : undefined;

  try {
    await updatePromptLibrary(editingPrompt.value);
    if (replaced && editingPrompt.value.agent_id != null) {
      notifyAssignmentResult(editingPrompt.value.agent_id, replaced);
    } else {
      toast.add({ title: "Prompt aktualisiert", color: "success" });
    }
    editingPrompt.value = null;
  } catch {
    toast.add({ title: "Speichern fehlgeschlagen", color: "error" });
  }
}

async function confirmDelete() {
  if (!deletingPrompt.value) return;
  try {
    await deletePromptLibrary(deletingPrompt.value.id);
    toast.add({ title: "Prompt gelöscht", color: "success" });
    deletingPrompt.value = null;
  } catch {
    toast.add({ title: "Löschen fehlgeschlagen", color: "error" });
  }
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-bold text-highlighted">
        System-Prompt-Generator
      </h2>
      <p class="text-muted mt-1">
        Neue System-Prompts per KI erstellen und in der Bibliothek ablegen
      </p>
    </div>

    <UCard>
      <div class="space-y-4">
        <UFormField label="Beschreibe das Ziel des Agents">
          <UTextarea
            v-model="promptDescription"
            data-testid="prompt-description"
            :rows="3"
          />
        </UFormField>
        <UButton
          data-testid="generate-prompt"
          icon="i-lucide-sparkles"
          :loading="loading"
          @click="generatePrompt"
        >
          Prompt generieren
        </UButton>
        <UTextarea
          v-if="generatedPrompt"
          v-model="generatedPrompt"
          data-testid="generated-prompt"
          class="w-full"
          :rows="6"
        />
        <UButton
          v-if="generatedPrompt"
          variant="outline"
          data-testid="save-prompt-to-library"
          @click="savePromptToLibrary"
        >
          In Bibliothek speichern
        </UButton>
      </div>
    </UCard>

    <AiStatusBar />

    <UCard class="min-w-0" data-testid="prompt-library">
      <template #header>
        <h3 class="font-semibold">Prompt-Bibliothek</h3>
      </template>

      <UAlert
        color="neutral"
        variant="subtle"
        class="mb-4"
        data-testid="prompt-assignment-hint"
        :description="PROMPT_ASSIGNMENT_HINT"
      />

      <UTable
        v-if="prompts?.length"
        class="table-fixed min-w-0"
        :data="prompts"
        :columns="[
          {
            accessorKey: 'name',
            header: 'Name',
            meta: { class: { th: 'w-[28%]', td: 'w-[28%]' } },
          },
          {
            id: 'agent',
            header: 'Agent',
            meta: { class: { th: 'w-[22%]', td: 'w-[22%]' } },
          },
          {
            accessorKey: 'created_at',
            header: 'Erstellt',
            meta: { class: { th: 'w-[20%]', td: 'w-[20%]' } },
          },
          {
            id: 'actions',
            header: 'Aktionen',
            meta: { class: { th: 'w-[22%]', td: 'w-[22%]' } },
          },
        ]"
      >
        <template #name-cell="{ row }">
          <span
            class="block min-w-0 whitespace-normal wrap-anywhere leading-snug"
          >
            {{ row.original.name }}
          </span>
        </template>
        <template #agent-cell="{ row }">
          <USelect
            :model-value="row.original.agent_id ?? null"
            :items="agentOptions"
            value-key="value"
            class="w-full min-w-0"
            :loading="assigningPromptId === row.original.id"
            data-testid="prompt-agent-select"
            @update:model-value="
              assignAgent(row.original, normalizeAgentId($event), {
                notify: normalizeAgentId($event) != null,
              })
            "
          />
        </template>
        <template #created_at-cell="{ row }">
          <span class="tabular-nums text-sm">
            {{ formatDateTime(row.original.created_at) }}
          </span>
        </template>
        <template #actions-cell="{ row }">
          <div class="flex flex-wrap gap-1">
            <UButton
              size="xs"
              variant="outline"
              icon="i-lucide-eye"
              data-testid="view-prompt"
              @click="openViewModal(row.original)"
            >
              Anzeigen
            </UButton>
            <UButton
              size="xs"
              variant="outline"
              icon="i-lucide-pencil"
              data-testid="edit-prompt"
              @click="openEditModal(row.original)"
            >
              Bearbeiten
            </UButton>
            <UButton
              size="xs"
              color="error"
              variant="ghost"
              icon="i-lucide-trash"
              data-testid="delete-prompt"
              @click="openDeleteModal(row.original)"
            />
          </div>
        </template>
      </UTable>

      <UAlert
        v-else
        color="neutral"
        variant="subtle"
        title="Noch keine Prompts gespeichert"
        description="Generiere einen System-Prompt und speichere ihn in der Bibliothek."
      />
    </UCard>

    <UModal v-model:open="viewModalOpen" title="Prompt anzeigen">
      <template v-if="viewingPrompt" #body>
        <div class="space-y-4 p-4">
          <div class="space-y-1 text-sm">
            <p>
              <span class="font-medium text-default">Name:</span>
              {{ viewingPrompt.name }}
            </p>
            <p>
              <span class="font-medium text-default">Erstellt:</span>
              {{ formatDateTime(viewingPrompt.created_at) }}
            </p>
          </div>
          <UFormField label="Agent">
            <USelect
              :model-value="viewingPrompt.agent_id ?? null"
              :items="agentOptions"
              value-key="value"
              class="w-full"
              data-testid="view-prompt-agent-select"
              @update:model-value="
                assignAgent(viewingPrompt!, normalizeAgentId($event), {
                  notify: true,
                })
              "
            />
          </UFormField>
          <UTextarea
            :model-value="viewingPrompt.prompt"
            readonly
            :rows="10"
            data-testid="view-prompt-content"
          />
        </div>
      </template>
    </UModal>

    <UModal v-model:open="editModalOpen" title="Prompt bearbeiten">
      <template v-if="editingPrompt" #body>
        <div class="space-y-4 p-4">
          <UFormField label="Name">
            <UInput
              v-model="editingPrompt.name"
              data-testid="edit-prompt-name"
            />
          </UFormField>
          <UAlert
            color="neutral"
            variant="subtle"
            :description="PROMPT_ASSIGNMENT_HINT"
          />
          <UAlert
            v-if="editingWouldReplace"
            color="warning"
            variant="subtle"
            :title="`Ersetzt „${editingWouldReplace.name}“`"
            description="Beim Speichern wird die bisherige Zuordnung für diesen Agent aufgehoben."
          />
          <UFormField label="Agent">
            <USelect
              v-model="editingPrompt.agent_id"
              :items="agentOptions"
              value-key="value"
              class="w-full"
              data-testid="edit-prompt-agent-select"
            />
          </UFormField>
          <UFormField label="System-Prompt">
            <UTextarea
              v-model="editingPrompt.prompt"
              data-testid="edit-prompt-content"
              :rows="10"
            />
          </UFormField>
          <div class="flex justify-end gap-2">
            <UButton variant="outline" @click="editingPrompt = null">
              Abbrechen
            </UButton>
            <UButton data-testid="confirm-edit-prompt" @click="saveEdit">
              Speichern
            </UButton>
          </div>
        </div>
      </template>
    </UModal>

    <UModal v-model:open="deleteModalOpen" title="Prompt löschen?">
      <template v-if="deletingPrompt" #body>
        <div class="space-y-4 p-4">
          <p>
            „{{ deletingPrompt.name }}“ wirklich aus der Bibliothek entfernen?
          </p>
          <p v-if="deletingPrompt.agent_id" class="text-sm text-muted">
            Zugeordnet zu:
            {{ agentNameById(agents ?? [], deletingPrompt.agent_id) }}
          </p>
          <div class="flex justify-end gap-2">
            <UButton variant="outline" @click="deletingPrompt = null">
              Abbrechen
            </UButton>
            <UButton
              color="error"
              data-testid="confirm-delete-prompt"
              @click="confirmDelete"
            >
              Löschen
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
