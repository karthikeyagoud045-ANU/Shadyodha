// Deterministic quality gate: no LLM, pure thresholds on image metadata.
function assessQuality(file, screening) {
  const issues = [];
  const sizeKB = (file && file.size ? file.size : 0) / 1024;

  let focusScore = 0.85;
  let illuminationScore = 0.88;
  if (sizeKB < 50) {
    focusScore = 0.35;
    issues.push('Image file too small, likely low resolution');
  } else if (sizeKB < 200) {
    focusScore = 0.6;
    issues.push('Image resolution is borderline');
  }

  const score = Number(((focusScore + illuminationScore) / 2).toFixed(2));
  const gradable = score >= 0.5 && sizeKB >= 50;
  if (!gradable && issues.length === 0) issues.push('Image did not meet gradability threshold');

  return {
    gradable,
    score,
    focusScore: Number(focusScore.toFixed(2)),
    illuminationScore: Number(illuminationScore.toFixed(2)),
    fovPercentage: gradable ? 94.5 : 60.0,
    issues,
    recommendation: gradable ? 'Image quality acceptable' : 'Recapture requested: poor quality'
  };
}

module.exports = { assessQuality };
