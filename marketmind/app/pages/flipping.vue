<script setup lang="ts">
import type { FlipAnalysisResult } from "~/composables/useFlipping";

definePageMeta({ layout: "default" });

const buyPrice = ref(100);
const sellPrice = ref(200);
const shipping = ref(10);
const packaging = ref(5);
const productName = ref("");
const result = ref<FlipAnalysisResult | null>(null);

const { loading, computeFlip, mergeRecommendation, analyzeWithAI, scoreColor } =
  useFlipping();

const scoreColorComputed = computed(() => scoreColor(result.value?.score));

watch(
  [buyPrice, sellPrice, shipping, packaging],
  () => {
    const calc = computeFlip({
      buyPrice: buyPrice.value,
      sellPrice: sellPrice.value,
      shipping: shipping.value,
      packaging: packaging.value,
    });
    result.value = mergeRecommendation(
      calc,
      result.value?.recommendation || "",
    );
  },
  { immediate: true },
);

async function runAnalyzeWithAI() {
  result.value = await analyzeWithAI({
    buyPrice: buyPrice.value,
    sellPrice: sellPrice.value,
    shipping: shipping.value,
    packaging: packaging.value,
    productName: productName.value,
  });
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-bold text-highlighted">Flipping-Kalkulator</h2>
      <UAlert
        color="info"
        variant="subtle"
        class="mt-2"
        description="Ausschließlich privater Verkauf – keine Plattformgebühren."
      />
    </div>

    <div class="grid md:grid-cols-2 gap-6">
      <UCard>
        <div class="space-y-4">
          <UFormField label="Produktname">
            <UInput
              v-model="productName"
              placeholder="Optional für KI-Analyse"
            />
          </UFormField>
          <UFormField label="Einkaufspreis (€)">
            <UInput
              v-model.number="buyPrice"
              data-testid="buy-price"
              type="number"
            />
          </UFormField>
          <UFormField label="Verkaufspreis (€)">
            <UInput
              v-model.number="sellPrice"
              data-testid="sell-price"
              type="number"
            />
          </UFormField>
          <UFormField label="Versandkosten (€)">
            <UInput v-model.number="shipping" type="number" />
          </UFormField>
          <UFormField label="Verpackungskosten (€)">
            <UInput v-model.number="packaging" type="number" />
          </UFormField>
          <UButton
            data-testid="ai-analyze"
            icon="i-lucide-sparkles"
            :loading="loading"
            @click="runAnalyzeWithAI"
          >
            KI-Empfehlung
          </UButton>
        </div>
      </UCard>

      <UCard v-if="result" data-testid="flip-result">
        <div class="space-y-3">
          <div class="flex justify-between">
            <span class="text-muted">Netto-Erlös</span>
            <span class="font-semibold">{{
              formatEuro(result.netProceeds)
            }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-muted">Rohgewinn</span>
            <span class="font-semibold">{{ formatEuro(result.profit) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-muted">Marge</span>
            <span class="font-semibold">{{
              formatPercent(result.marginPercent)
            }}</span>
          </div>
          <UBadge
            data-testid="flip-score"
            :color="scoreColorComputed"
            size="lg"
            class="mt-2"
          >
            {{ result.score }}
          </UBadge>
          <MarkdownContent
            v-if="result.recommendation"
            :content="String(result.recommendation)"
          />
        </div>
      </UCard>
    </div>
  </div>
</template>
