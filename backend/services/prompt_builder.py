import random
from services.xai_metrics import RISK_TIERS

INSTRUCTION_POOL = [
    # --- Role-based (who you are) ---
    "As a perception engineer, write a diagnostic report for this detection result.",
    "You are an autonomous vehicle safety auditor. Assess this detection for deployment readiness.",
    "Acting as an XAI researcher, interpret the saliency evidence behind this detection.",
    "As a V&V (Verification & Validation) engineer, evaluate whether this detection meets safety standards.",
    "You are reviewing this detection as part of an ODD (Operational Design Domain) compliance check.",

    # --- Task-based (what to do) ---
    "Analyze this autonomous driving detection and explain the model's attention behavior.",
    "Diagnose whether this object detection is reliable based on the XAI heatmap evidence.",
    "Evaluate the model's attention pattern for this detected object and assess its safety implications.",
    "Write a root-cause analysis for this detection outcome using the XAI metrics provided.",
    "Determine if this detection is driven by genuine object features or background shortcuts.",
    "Cross-reference the heatmap attention with the bounding box to verify detection integrity.",
    "Assess the quality of this object detection using the provided XAI saliency data.",

    # --- Question-based (answer a question) ---
    "Is this detection trustworthy? Use the heatmap and XAI metrics to justify your answer.",
    "What does the attention pattern reveal about why this object was detected or missed?",
    "Can this detection be trusted in a safety-critical autonomous driving scenario? Explain why.",
    "Does the model focus on the right features for this object, or is it relying on shortcuts?",
    "What would happen if this detection occurred in a real-world driving situation?",
    "Based on the saliency map, is the model looking at the object or the surrounding context?",

    # --- Scenario-based (situational framing) ---
    "This detection was flagged during a routine perception audit. Analyze the XAI evidence.",
    "A field test produced this detection result. Evaluate if it indicates a systemic model weakness.",
    "During shadow-mode testing, this result was logged. Provide your diagnostic interpretation.",
    "This case was escalated from automated QA. Review the attention metrics and explain the outcome.",
    "Imagine this detection occurs at 60 km/h in urban traffic. How critical is the model's attention pattern?",

    # --- Concise / Direct ---
    "Interpret the attention heatmap and metrics for this object.",
    "Examine the heatmap and detection metrics to determine if this result can be trusted.",
    "Review this XAI analysis of an autonomous driving detection.",
    "Provide a safety-focused analysis of this detection based on the explainability metrics.",
    "Analyze the relationship between model attention and detection outcome for this object.",
    "Explain what the saliency map tells us about this detection's reliability.",
    "Summarize the XAI diagnostic findings for this detected object.",
]

def _format_metrics(metrics):
    return "\n".join(f"  - {k}: {v}" for k, v in metrics.items())

def _format_globals(global_metrics):
    return "\n".join(f"  - {k}: {v}" for k, v in global_metrics.items())

def _common_context(obj, image_level):
    obj_class, obj_type = obj['object_class'], obj['object_type']
    risk = RISK_TIERS.get(obj_class, 'LOW')
    metrics = _format_metrics(obj.get('xai_metrics', {}))
    globals_str = _format_globals(image_level.get('global_metrics', {}))
    conf_line = f"- Confidence: {obj.get('confidence', 'N/A')}" if obj_type != 'FN' else ''
    iou_line = f"- IoU with GT: {obj.get('iou', 'N/A')}" if obj_type == 'TP' else ''

    return (
        "IMAGE CONTEXT:\n"
        "This 3-panel image shows an autonomous driving scene:\n"
        "- Left: Original RGB image\n"
        "- Center: EigenCAM saliency heatmap (red/yellow = high attention)\n"
        "- Right: Heatmap overlaid with detection boxes (Green=TP, Yellow=FP, Red=FN)\n\n"
        f"IMAGE-LEVEL STATS: TP={image_level.get('tp_count', 0)} | FP={image_level.get('fp_count', 0)} | FN={image_level.get('fn_count', 0)} | "
        f"Precision={image_level.get('precision', 0)} | Recall={image_level.get('recall', 0)}\n\n"
        f"TARGET OBJECT:\n"
        f"- Class: {obj_class}\n"
        f"- Detection Result: {obj_type}\n"
        f"- Risk Tier: {risk}\n"
        f"- Bounding Box (x, y, w, h): {obj.get('bbox', 'N/A')}\n"
        f"{conf_line}\n{iou_line}\n\n"
        f"PER-OBJECT XAI METRICS:\n{metrics}\n\n"
        f"GLOBAL XAI METRICS:\n{globals_str}"
    )

def build_prompt_style_a(obj, image_level):
    ctx = _common_context(obj, image_level)
    return (
        "You are a senior AI safety researcher.\n\n"
        f"{ctx}\n\n"
        "TASK: Write a natural, flowing diagnostic narrative (2-4 paragraphs, NO headings or numbered sections). "
        "Cover: where the model's attention falls relative to this object, whether the detection relies on "
        "genuine object features or spurious background cues, what caused the detection to succeed or fail, "
        "and the safety risk level. Vary your sentence structure and vocabulary naturally. "
        "Be specific about metric values when they support your argument."
    )

def build_prompt_style_b(obj, image_level):
    ctx = _common_context(obj, image_level)
    return (
        "You are a perception QA engineer reviewing detection logs.\n\n"
        f"{ctx}\n\n"
        "TASK: Provide a concise bullet-point diagnostic (5-8 bullets). Each bullet should be 1-2 sentences. "
        "Cover attention localization, spurious correlation risk, root cause of success/failure, and safety verdict. "
        "Use plain, direct language. No headers. Start each bullet with a dash (-)."
    )

def build_prompt_style_c(obj, image_level):
    ctx = _common_context(obj, image_level)
    return (
        "You are an autonomous driving safety auditor.\n\n"
        f"{ctx}\n\n"
        "TASK: Structure your analysis as:\n"
        "OBSERVATION: What does the heatmap show for this object? (2-3 sentences)\n"
        "EVIDENCE: Which XAI metrics support or contradict reliable detection? (cite specific values)\n"
        "DIAGNOSIS: Why did the model succeed, fail, or false-alarm? (2-3 sentences)\n"
        "VERDICT: One-line safety risk rating with brief justification.\n\n"
        "Use these exact section labels. Be analytical and data-driven."
    )

def build_prompt_style_d(obj, image_level):
    ctx = _common_context(obj, image_level)
    detail_level = random.choice(["brief (3-5 sentences total)", "moderate (1-2 paragraphs)", "detailed (3-4 paragraphs)"])
    focus = random.choice([
        "Focus especially on the spurious correlation risk.",
        "Pay special attention to whether the attention pattern matches the object location.",
        "Emphasize the safety implications given the object's risk tier.",
        "Highlight what this case reveals about the model's failure modes.",
    ])
    return (
        "You are an XAI researcher writing a case study.\n\n"
        f"{ctx}\n\n"
        f"TASK: Write a {detail_level} technical analysis of this detection. "
        f"{focus} "
        "Reference specific metric values to support your claims. "
        "Use your own structure and wording — do not follow any rigid template."
    )

PROMPT_BUILDERS = [
    build_prompt_style_a,
    build_prompt_style_b,
    build_prompt_style_c,
    build_prompt_style_d,
]

def generate_random_prompt(obj, image_level):
    builder = random.choice(PROMPT_BUILDERS)
    instruction = random.choice(INSTRUCTION_POOL)
    prompt_text = builder(obj, image_level)
    return instruction, prompt_text
