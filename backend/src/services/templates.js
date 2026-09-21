// ponytail: plain template map, no i18n lib for 3 static strings.
const TEMPLATES = {
  REFERRAL_CREATED: {
    hi: (p, r) => `Namaste ${p.name}, aapko ${r.referredTo} jaane ki salah di gayi hai (priority: ${r.priority}). Kripya apna referral turant poora karein. - DRISHTI AI`,
    en: (p, r) => `Hello ${p.name}, you have been referred to ${r.referredTo} (priority: ${r.priority}). Please complete your referral visit soon. - DRISHTI AI`,
    ta: (p, r) => `Vanakkam ${p.name}, neengal ${r.referredTo} selvadhu parindhuraikkapattulladhu (priority: ${r.priority}). Thayavu seydhu referral-ai mudiyungal. - DRISHTI AI`,
  },
};

function draftMessage(type, lang, patient, referral) {
  const t = (TEMPLATES[type] || {})[lang] || TEMPLATES[type].hi;
  return t(patient, referral);
}

module.exports = { draftMessage };
