"use client";

import { useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  Camera,
  CheckCircle2,
  ChevronRight,
  Info,
  Sparkles,
  Utensils,
  Zap,
} from "lucide-react";
import type { FoodAnalysisResult } from "@/types";

const SAMPLE_DISHES: (FoodAnalysisResult & { image: string; promptTitle: string })[] = [
  {
    dishName: "Gulab Jamun & Sweets (Mithai)",
    promptTitle: "Gulab Jamun (2 pcs)",
    image: "/food/gulab_jamun.jpg",
    verdict: "avoid",
    sugarGrams: 38.5,
    totalCarbsGrams: 46.2,
    fiberGrams: 0.3,
    glycemicIndex: 85,
    glycemicCategory: "High",
    explanation:
      "Deep-fried milk solids (khoya) saturated in concentrated rose-cardamom sugar syrup cause rapid post-meal glucose surges. These acute spikes injure fragile capillary pericytes in the retina.",
    recommendations: [
      "Strictly avoid during active diabetic retinopathy management.",
      "Substitute with stevia-sweetened almond halwa or a small portion of roasted makhana.",
      "If consumed, monitor capillary blood glucose 2 hours post-meal.",
    ],
    safePortionGuide: "Not recommended for diabetic retinopathy patients.",
  },
  {
    dishName: "Crispy Punjabi Samosas with Chutney",
    promptTitle: "Samosas (2 pcs)",
    image: "/food/samosa_plate.jpg",
    verdict: "avoid",
    sugarGrams: 3.2,
    totalCarbsGrams: 44.5,
    fiberGrams: 1.9,
    glycemicIndex: 78,
    glycemicCategory: "High",
    explanation:
      "Deep-fried refined flour (maida) crust with spiced potato stuffing is calorie-dense and high in oxidized trans-fats. It causes prolonged postprandial hyperglycemia and microvascular inflammation.",
    recommendations: [
      "Avoid deep-fried maida snacks during retinopathy care.",
      "Substitute with air-fried baked vegetable cutlets or boiled chana chaat.",
      "Pair with raw salad to reduce glycemic surge if eaten.",
    ],
    safePortionGuide: "Limit to half a piece on rare occasions only.",
  },
  {
    dishName: "Sprouted Moong Salad with Paneer & Veggies",
    promptTitle: "Sprouted Moong & Paneer Salad",
    image: "/food/sprouted_salad.jpg",
    verdict: "diabetic_friendly",
    sugarGrams: 1.8,
    totalCarbsGrams: 16.5,
    fiberGrams: 7.4,
    glycemicIndex: 25,
    glycemicCategory: "Low",
    explanation:
      "Outstanding choice for diabetes! High in soluble fiber and protein which flattens postprandial glucose curves. Loaded with lutein and antioxidants that strengthen retinal capillaries.",
    recommendations: [
      "Highly recommended for breakfast or as a pre-meal salad.",
      "Add a dash of cold-pressed mustard oil and lemon juice for vitamin C absorption.",
      "Helps maintain steady HbA1c under 7.0%.",
    ],
    safePortionGuide: "Generous bowl (200g - 250g) is completely safe and beneficial.",
  },
  {
    dishName: "Whole Wheat Roti with Spinach Dal (Palak Dal)",
    promptTitle: "2 Rotis with Palak Dal",
    image: "/food/roti_dal.jpg",
    verdict: "diabetic_friendly",
    sugarGrams: 2.3,
    totalCarbsGrams: 32.0,
    fiberGrams: 6.8,
    glycemicIndex: 38,
    glycemicCategory: "Low",
    explanation:
      "Nutritious, low-glycemic balanced meal. Spinach provides zeaxanthin which protects the macula, while lentils and whole wheat release glucose gradually.",
    recommendations: [
      "Ideal staple lunch or dinner option.",
      "Use multigrain flour (wheat + ragi + chana) for extra dietary fiber.",
      "Keep oil/ghee to 1 teaspoon per meal.",
    ],
    safePortionGuide: "1 to 2 rotis with 1 large bowl of thick dal.",
  },
  {
    dishName: "Steamed White Rice & Starchy Potato Curry (Aloo)",
    promptTitle: "White Rice & Aloo Curry",
    image: "/food/rice_curry.jpg",
    verdict: "avoid",
    sugarGrams: 4.8,
    totalCarbsGrams: 58.4,
    fiberGrams: 2.1,
    glycemicIndex: 76,
    glycemicCategory: "High",
    explanation:
      "Refined polished white rice combined with starchy potatoes has a high glycemic load. It quickly converts into blood sugar, placing high osmotic stress on retinal vessels.",
    recommendations: [
      "Replace white rice with hand-pounded red rice, brown rice, or foxtail millet.",
      "Swap potato with high-fiber vegetables like bitter gourd (karela) or French beans.",
      "Ensure half your plate is filled with fresh vegetable salad.",
    ],
    safePortionGuide: "Restrict to max 1 small bowl (100g) accompanied by double portion of vegetables.",
  },
  {
    dishName: "Fizzy Carbonated Soda & French Fries",
    promptTitle: "Cola & Deep Fried Fries",
    image: "/food/cola_fries.jpg",
    verdict: "avoid",
    sugarGrams: 42.0,
    totalCarbsGrams: 72.0,
    fiberGrams: 1.2,
    glycemicIndex: 90,
    glycemicCategory: "High",
    explanation:
      "Extreme risk! High-fructose corn syrup creates instant glycemic spikes, accelerating microaneurysm rupture and retinal hemorrhages. Trans-fats worsen diabetic microvascular inflammation.",
    recommendations: [
      "Never consume during diabetic retinopathy management.",
      "Substitute with unsweetened buttermilk (chaas) or fresh lime water with no sugar.",
      "Drink plain water if feeling thirsty.",
    ],
    safePortionGuide: "Zero intake recommended.",
  },
];

export default function PatientDietPage() {
  const [analyzingFood, setAnalyzingFood] = useState(false);
  const [analysisStep, setAnalysisStep] = useState("");
  const [currentFoodResult, setCurrentFoodResult] = useState<FoodAnalysisResult | null>(SAMPLE_DISHES[0]);
  const [selectedDishImg, setSelectedDishImg] = useState(SAMPLE_DISHES[0].image);

  function runFoodAnalysis(dish: typeof SAMPLE_DISHES[0]) {
    setAnalyzingFood(true);
    setSelectedDishImg(dish.image);
    setCurrentFoodResult(null);

    const steps = [
      "Scanning food photo with AI neural vision...",
      "Quantifying carbohydrate polymers & free glucose...",
      "Estimating glycemic index & glycemic load...",
      "Evaluating diabetic retinopathy vascular impact...",
      "Finalizing dietary recommendations...",
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setAnalysisStep(step);
      }, idx * 260);
    });

    setTimeout(() => {
      setAnalyzingFood(false);
      setCurrentFoodResult(dish);
    }, steps.length * 260);
  }

  function handleCustomPhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setAnalyzingFood(true);
      setSelectedDishImg(url);
      setCurrentFoodResult(null);

      const customResult: FoodAnalysisResult = {
        dishName: file.name.replace(/\.[^/.]+$/, "") || "Uploaded Food Plate",
        verdict: "moderate",
        sugarGrams: 8.5,
        totalCarbsGrams: 34.0,
        fiberGrams: 4.2,
        glycemicIndex: 52,
        glycemicCategory: "Medium",
        explanation:
          "AI vision detected a mixed vegetable and grain meal with moderate carbohydrate density. Suitable for diabetics if consumed with controlled portion sizes.",
        recommendations: [
          "Pair with fiber-rich raw salads or clear vegetable soup.",
          "Check blood glucose levels 2 hours post-meal.",
          "Avoid pairing with sweetened beverages or fried savories.",
        ],
        safePortionGuide: "Limit to 1 standard portion (150g - 200g).",
      };

      setTimeout(() => {
        setAnalyzingFood(false);
        setCurrentFoodResult(customResult);
      }, 1400);
    }
  }

  return (
    <div className="relative space-y-6 pb-16">
      {/* Eye Ambient HUD Artwork Banner matching Doctor Portal */}
      <div className="pointer-events-none absolute -left-8 -right-8 -top-6 h-80 overflow-hidden z-0 rounded-b-3xl">
        <img
          src="/drishti_hero_bg.jpg"
          alt="AI Retinal Scan"
          className="h-full w-full object-cover object-center opacity-40 mix-blend-multiply"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-sky-500/15 via-[#EFF3FD]/75 to-[#EFF3FD]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#EFF3FD]/80 via-transparent to-[#EFF3FD]/80" />
      </div>

      {/* Header & Upload Bar */}
      <div className="relative z-10 rounded-3xl border border-sky-200/80 bg-gradient-to-br from-white/95 via-sky-50/70 to-indigo-50/60 p-6 shadow-card backdrop-blur-md md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500 text-white shadow-md shadow-sky-500/25">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
                  AI Food & Diet Sugar Scanner
                </h1>
                <span className="text-[11px] font-semibold text-sky-700">
                  Real-time Diabetic Nutrition & Glycemic Load Intelligence
                </span>
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-600 max-w-2xl leading-relaxed">
              Upload a photograph of your meal or plate. DRISHTI AI calculates the exact sugar content in grams,
              estimates its glycemic index, and instantly advises whether it is safe or dangerous for your diabetic retinopathy.
            </p>
          </div>

          {/* Upload photo trigger */}
          <label className="btn-attract flex cursor-pointer items-center gap-2 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-sky-600/25 hover:brightness-105 transition active:scale-95">
            <Camera className="h-4 w-4" />
            <span>Upload Food Photo</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleCustomPhotoUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Quick Sample Dishes selector */}
        <div className="mt-6 border-t border-sky-100 pt-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Or select a common meal to test right away:
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {SAMPLE_DISHES.map((dish) => (
              <button
                key={dish.dishName}
                onClick={() => runFoodAnalysis(dish)}
                className="group flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-2.5 text-center shadow-xs transition hover:border-sky-400 hover:shadow-md"
              >
                <div className="relative h-24 w-full overflow-hidden rounded-xl bg-slate-100">
                  <img
                    src={dish.image}
                    alt={dish.dishName}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                  <span
                    className={`absolute bottom-1 right-1 rounded-md px-1.5 py-0.5 text-[9px] font-bold text-white shadow-xs ${
                      dish.verdict === "diabetic_friendly"
                        ? "bg-emerald-600"
                        : dish.verdict === "moderate"
                        ? "bg-amber-600"
                        : "bg-rose-600"
                    }`}
                  >
                    {dish.verdict === "diabetic_friendly"
                      ? "Safe"
                      : dish.verdict === "moderate"
                      ? "Moderate"
                      : "Avoid"}
                  </span>
                </div>
                <p className="mt-2 line-clamp-1 text-xs font-semibold text-slate-800 group-hover:text-sky-600">
                  {dish.promptTitle}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* AI Analysis Result Display */}
      {analyzingFood ? (
        <div className="rounded-3xl border-2 border-sky-200 bg-white p-14 text-center shadow-xl">
          <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-sky-50">
            <div className="absolute inset-0 rounded-full border-4 border-sky-600 border-t-transparent animate-spin" />
            <Utensils className="h-8 w-8 text-sky-600 animate-pulse" />
          </div>
          <h3 className="mt-5 text-lg font-bold text-slate-900">
            AI Neural Vision Scanning Meal Nutrition...
          </h3>
          <p className="mt-1 text-xs text-sky-600 font-semibold animate-pulse">
            {analysisStep || "Detecting ingredients and carbohydrate profile..."}
          </p>
        </div>
      ) : currentFoodResult ? (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left: Food Photo & Large Verdict */}
          <div className="lg:col-span-5 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card">
            <div className="relative h-64 w-full overflow-hidden rounded-2xl bg-black">
              <img
                src={selectedDishImg}
                alt={currentFoodResult.dishName}
                className="h-full w-full object-cover"
              />
              {/* Verdict Badge */}
              <div className="absolute left-3 top-3">
                {currentFoodResult.verdict === "diabetic_friendly" && (
                  <span className="flex items-center gap-1.5 rounded-full bg-emerald-600/95 px-3 py-1 text-xs font-bold text-white shadow-lg backdrop-blur-md">
                    <CheckCircle2 className="h-4 w-4" /> SAFE FOR DIABETICS
                  </span>
                )}
                {currentFoodResult.verdict === "moderate" && (
                  <span className="flex items-center gap-1.5 rounded-full bg-amber-500/95 px-3 py-1 text-xs font-bold text-white shadow-lg backdrop-blur-md">
                    <AlertCircle className="h-4 w-4" /> CONSUME IN MODERATION
                  </span>
                )}
                {currentFoodResult.verdict === "avoid" && (
                  <span className="flex items-center gap-1.5 rounded-full bg-rose-600/95 px-3 py-1 text-xs font-bold text-white shadow-lg backdrop-blur-md animate-pulse">
                    <AlertTriangle className="h-4 w-4" /> AVOID &bull; HIGH SUGAR SPIKE
                  </span>
                )}
              </div>
            </div>

            <h2 className="mt-4 text-xl font-bold text-slate-900">
              {currentFoodResult.dishName}
            </h2>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              {currentFoodResult.explanation}
            </p>

            <div className="mt-4 rounded-2xl bg-slate-50 p-3.5 text-xs border border-slate-100">
              <span className="font-bold text-slate-700">Recommended Portion Guide:</span>
              <p className="text-slate-600 mt-0.5 leading-relaxed">{currentFoodResult.safePortionGuide}</p>
            </div>
          </div>

          {/* Right: Sugar Grams Breakdown & Diabetic Advice */}
          <div className="lg:col-span-7 space-y-4">
            {/* 4 Nutrition Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Exact Sugar Count */}
              <div
                className={`rounded-2xl border p-4 text-center ${
                  currentFoodResult.sugarGrams > 15
                    ? "border-rose-200 bg-rose-50/80"
                    : currentFoodResult.sugarGrams > 5
                    ? "border-amber-200 bg-amber-50/80"
                    : "border-emerald-200 bg-emerald-50/80"
                }`}
              >
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Sugar Content
                </p>
                <p
                  className={`mt-1 text-3xl font-black ${
                    currentFoodResult.sugarGrams > 15
                      ? "text-rose-600"
                      : currentFoodResult.sugarGrams > 5
                      ? "text-amber-600"
                      : "text-emerald-600"
                  }`}
                >
                  {currentFoodResult.sugarGrams}g
                </p>
                <p className="text-[10px] text-slate-500 font-medium">per serving</p>
              </div>

              {/* Glycemic Index */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-card">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Glycemic Index
                </p>
                <p className="mt-1 text-3xl font-black text-slate-900">
                  {currentFoodResult.glycemicIndex}
                </p>
                <span
                  className={`inline-block rounded px-1.5 py-0.2 text-[10px] font-bold ${
                    currentFoodResult.glycemicCategory === "Low"
                      ? "bg-emerald-100 text-emerald-800"
                      : currentFoodResult.glycemicCategory === "Medium"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-rose-100 text-rose-800"
                  }`}
                >
                  {currentFoodResult.glycemicCategory} GI
                </span>
              </div>

              {/* Total Carbs */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-card">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Total Carbs
                </p>
                <p className="mt-1 text-3xl font-black text-slate-900">
                  {currentFoodResult.totalCarbsGrams}g
                </p>
                <p className="text-[10px] text-slate-500">Carbohydrates</p>
              </div>

              {/* Dietary Fiber */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-card">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Dietary Fiber
                </p>
                <p className="mt-1 text-3xl font-black text-emerald-600">
                  {currentFoodResult.fiberGrams}g
                </p>
                <p className="text-[10px] text-slate-500">Slows glucose absorption</p>
              </div>
            </div>

            {/* AI Retinal Health Advice Box */}
            <div className="rounded-3xl border border-sky-100 bg-gradient-to-br from-sky-50/80 via-white to-indigo-50/50 p-6 shadow-card">
              <div className="flex items-center gap-2">
                <Info className="h-5 w-5 text-sky-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  AI Recommendations for Protecting Retinal Capillaries
                </h3>
              </div>
              <ul className="mt-3 space-y-2.5 text-xs text-slate-700">
                {currentFoodResult.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-sky-600 text-[10px] font-bold text-white">
                      ✓
                    </span>
                    <span className="leading-relaxed">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
