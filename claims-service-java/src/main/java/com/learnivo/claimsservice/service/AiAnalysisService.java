package com.learnivo.claimsservice.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * AI Analysis Service — faithful Java translation of the Node.js AI logic.
 * Covers: bad-words filter, extractive summarization, Jaccard similarity,
 * category prediction, sentiment analysis, draft response generation,
 * SLA deadline calculation, state-machine validation, and auto-assignment.
 */
@Service
@Slf4j
public class AiAnalysisService {

    // ── Bad Words ─────────────────────────────────────────────────────────────
    private static final List<String> BAD_WORDS = List.of(
            "idiot", "stupid", "dumb", "hate", "terrible", "awful", "shut up", "useless",
            "garbage", "trash", "damn", "hell", "crap", "fuck", "shit", "asshole", "bitch",
            "dick", "piss", "bastard", "slut", "whore", "moron"
    );

    // ── SLA Configuration ─────────────────────────────────────────────────────
    public static final Map<String, SlaConfig> SLA_CONFIG;

    static {
        Map<String, SlaConfig> m = new LinkedHashMap<>();
        m.put("LOW",      new SlaConfig(72, 48, 60));
        m.put("MEDIUM",   new SlaConfig(48, 24, 36));
        m.put("HIGH",     new SlaConfig(24, 12, 18));
        m.put("CRITICAL", new SlaConfig(4,  2,  3));
        SLA_CONFIG = Collections.unmodifiableMap(m);
    }

    public record SlaConfig(int maxHours, int warnHours, int escalateHours) {}

    // ── State Machine ─────────────────────────────────────────────────────────
    public static final Map<String, List<String>> VALID_TRANSITIONS;

    static {
        Map<String, List<String>> m = new LinkedHashMap<>();
        m.put("CREATED",     List.of("IN_PROGRESS", "REJECTED"));
        m.put("IN_PROGRESS", List.of("RESOLVED", "REJECTED"));
        m.put("RESOLVED",    List.of("CLOSED", "IN_PROGRESS"));
        m.put("CLOSED",      List.of());
        m.put("REJECTED",    List.of());
        VALID_TRANSITIONS = Collections.unmodifiableMap(m);
    }

    // ── Auto-Assignment ───────────────────────────────────────────────────────
    private static final Map<String, String> AGENT_ASSIGNMENTS = Map.of(
            "Technical", "tech-support@learnivo.com",
            "Billing",   "billing@learnivo.com",
            "Account",   "account@learnivo.com",
            "Content",   "support@learnivo.com",
            "General",   "support@learnivo.com",
            "Other",     "support@learnivo.com"
    );

    // ── Priority escalation map ───────────────────────────────────────────────
    public static final Map<String, String> PRIORITY_ESCALATION = Map.of(
            "LOW",      "MEDIUM",
            "MEDIUM",   "HIGH",
            "HIGH",     "CRITICAL",
            "CRITICAL", "CRITICAL"
    );

    // ── Sentiment word lists ──────────────────────────────────────────────────
    private static final List<String> URGENT_WORDS = List.of(
            "urgent", "immediately", "asap", "critical", "emergency", "broken", "crash",
            "fail", "error", "bug", "down", "blocked", "stuck", "cannot access",
            "lost data", "security"
    );
    private static final List<String> NEGATIVE_WORDS = List.of(
            "angry", "frustrated", "disappointed", "unacceptable", "ridiculous",
            "annoying", "pathetic", "disgusting"
    );
    private static final List<String> POSITIVE_WORDS = List.of(
            "please", "thank", "appreciate", "kind", "help", "request", "would like",
            "hoping", "could you", "suggestion", "improve", "consider"
    );

    // ── Draft response pools ──────────────────────────────────────────────────
    private static final Map<String, List<String>> CATEGORY_ACTIONS = Map.of(
            "Technical", List.of(
                    "Our engineering team will investigate the root cause and deploy a fix.",
                    "We are escalating this to our technical support specialists for immediate diagnosis.",
                    "A senior developer has been assigned to troubleshoot this problem.",
                    "We will reproduce the issue in our test environment and provide a patch."
            ),
            "Billing", List.of(
                    "Our finance department will review your account and process any necessary adjustments.",
                    "We are verifying your payment records and will issue a correction if needed.",
                    "A billing specialist will contact you within 24 hours to resolve this.",
                    "We will audit the transaction history and ensure your account is properly updated."
            ),
            "Account", List.of(
                    "Our security team will verify your identity and restore access promptly.",
                    "We are reviewing your account settings to resolve the access issue.",
                    "An account specialist has been assigned to assist you directly.",
                    "We will perform a full security check and reset any compromised credentials."
            ),
            "Content", List.of(
                    "Our content review team will evaluate the material and make necessary corrections.",
                    "We are forwarding this to the course instructor for immediate review.",
                    "A curriculum specialist will assess the issue and update the content.",
                    "We will verify the course material accuracy and publish corrections if needed."
            ),
            "General", List.of(
                    "Our support team will review your request and provide a detailed response.",
                    "We have assigned a dedicated agent to look into this matter.",
                    "Your request has been queued for review by our experienced support staff.",
                    "We are carefully evaluating your concern to provide the best resolution."
            )
    );

    private static final Map<String, List<String>> GREETINGS = Map.of(
            "NEGATIVE", List.of(
                    "Dear Student, I sincerely apologize for the inconvenience regarding \"%s\".",
                    "Dear Student, I understand your frustration with \"%s\" and I want to assure you we take this seriously.",
                    "Dear Student, I'm truly sorry you're experiencing this issue with \"%s\".",
                    "Dear Student, we deeply regret the trouble you've encountered concerning \"%s\"."
            ),
            "NEUTRAL", List.of(
                    "Hello! Thank you for reaching out about \"%s\".",
                    "Hi there! We appreciate you contacting us regarding \"%s\".",
                    "Dear Student, thank you for bringing \"%s\" to our attention.",
                    "Hello! We've received your claim about \"%s\" and want to help."
            ),
            "POSITIVE", List.of(
                    "Hello! Thank you so much for your thoughtful feedback on \"%s\".",
                    "Hi! We really appreciate you taking the time to share your thoughts about \"%s\".",
                    "Dear Student, we're grateful for your constructive input regarding \"%s\".",
                    "Hello! It's great to hear from you about \"%s\" — thank you for reaching out."
            )
    );

    private static final Map<String, List<String>> URGENCY_LINES = Map.of(
            "CRITICAL", List.of(
                    "This has been flagged as CRITICAL and our on-call team is already mobilized.",
                    "Given the critical nature, this is our top priority and we aim to resolve it within 4 hours.",
                    "This critical issue has triggered our emergency response protocol."
            ),
            "HIGH", List.of(
                    "This has been marked as high priority and will be addressed within 24 hours.",
                    "Our team has fast-tracked this request for expedited resolution.",
                    "Given the urgency, we have escalated this to our senior support team."
            ),
            "MEDIUM", List.of(
                    "We expect to have an update for you within 48 hours.",
                    "Our team will prioritize this alongside current high-impact items.",
                    "You should receive a detailed response within 1-2 business days."
            ),
            "LOW", List.of(
                    "Our team will review this and respond within 2-3 business days.",
                    "We will address this in our regular support queue and keep you updated.",
                    "You can expect a follow-up from us within 72 hours."
            )
    );

    private static final List<String> CLOSINGS = List.of(
            "If you have any additional details to share, please don't hesitate to update this claim.",
            "We'll keep you informed of every step in the resolution process.",
            "Thank you for your patience — we're committed to resolving this for you.",
            "Please feel free to reply if you have further questions or concerns.",
            "Rest assured, your satisfaction is our priority and we will follow up promptly."
    );

    private static final Map<String, List<String>> STRATEGIES = Map.of(
            "CRITICAL", List.of(
                    "🚨 CRITICAL issue. Immediate attention required — SLA: 4 hours.",
                    "🚨 Emergency-level claim detected. Mobilize on-call support immediately.",
                    "🚨 Critical severity. This must be resolved before any other pending claims."
            ),
            "HIGH", List.of(
                    "High-priority issue. Prioritize resolution within 24 hours.",
                    "Elevated urgency detected. Assign a senior agent and fast-track.",
                    "This claim requires immediate escalation to the relevant team lead."
            ),
            "NEGATIVE_HIGH", List.of(
                    "The student is frustrated AND the issue is urgent. Handle with empathy + speed.",
                    "Negative sentiment combined with high urgency — personal outreach recommended.",
                    "Student dissatisfaction detected on a high-priority matter. Prioritize carefully."
            ),
            "NEGATIVE", List.of(
                    "The student seems frustrated. A personal, empathetic response is recommended.",
                    "Negative sentiment detected. Start with an apology and acknowledge their concern.",
                    "The tone suggests dissatisfaction. Show understanding before providing solutions.",
                    "Student frustration detected — consider calling or sending a personalized email."
            ),
            "POSITIVE", List.of(
                    "Positive and constructive tone. A friendly, helpful response will work well.",
                    "The student is being polite and patient — match their tone with a warm reply.",
                    "Constructive feedback received. Acknowledge their input and provide a clear timeline."
            ),
            "NEUTRAL", List.of(
                    "Standard request. Review the details and respond with a clear resolution plan.",
                    "Routine claim — assign to the appropriate service team for processing.",
                    "Normal priority inquiry. Provide a structured response with next steps.",
                    "Standard support request. Gather any missing details and proceed with resolution."
            )
    );

    // ── Public API ────────────────────────────────────────────────────────────

    /**
     * Check if text contains any bad words using word-boundary regex.
     */
    public boolean containsBadWords(String text) {
        if (text == null || text.isBlank()) return false;
        String lower = text.toLowerCase();
        for (String word : BAD_WORDS) {
            // Escape special regex chars in the word (e.g. "shut up" has a space)
            String escaped = Pattern.quote(word);
            Pattern p = Pattern.compile("\\b" + escaped + "\\b", Pattern.CASE_INSENSITIVE);
            if (p.matcher(lower).find()) return true;
        }
        return false;
    }

    /**
     * Extractive summarization: return first sentence with >4 words, else truncate to 100 chars.
     */
    public String extractSummary(String text) {
        if (text == null || text.length() < 50) return text;
        // Split on sentence-ending punctuation
        String[] sentences = text.split("(?<=[.!?])\\s*");
        for (String s : sentences) {
            String trimmed = s.trim();
            if (trimmed.split("\\s+").length > 4) {
                return trimmed;
            }
        }
        return text.substring(0, Math.min(100, text.length())) + "...";
    }

    /**
     * Jaccard similarity between two strings (tokenized to word sets).
     */
    public double calculateSimilarity(String str1, String str2) {
        Set<String> set1 = tokenize(str1 != null ? str1 : "");
        Set<String> set2 = tokenize(str2 != null ? str2 : "");
        if (set1.isEmpty() || set2.isEmpty()) return 0.0;

        long intersection = set1.stream().filter(set2::contains).count();
        long union = set1.size() + set2.size() - intersection;
        return union == 0 ? 0.0 : (double) intersection / union;
    }

    /**
     * Predict category from text keywords.
     */
    public String predictCategory(String text) {
        String lower = (text != null ? text : "").toLowerCase();
        if (lower.contains("password") || lower.contains("login") ||
                lower.contains("account") || lower.contains("sign in")) return "Account";
        if (lower.contains("payment") || lower.contains("billing") ||
                lower.contains("refund") || lower.contains("price") ||
                lower.contains("invoice")) return "Billing";
        if (lower.contains("bug") || lower.contains("error") ||
                lower.contains("crash") || lower.contains("slow") ||
                lower.contains("not working")) return "Technical";
        if (lower.contains("course") || lower.contains("lesson") ||
                lower.contains("content") || lower.contains("quiz")) return "Content";
        return "General";
    }

    /**
     * Full sentiment analysis result.
     */
    public record SentimentResult(
            String priority,
            String sentiment,
            int urgencyScore,
            int sentimentScore,
            String suggestedResponse,
            String predictedCat,
            String aiDraft
    ) {}

    /**
     * Analyze sentiment, compute priority, generate AI suggestion and draft response.
     * Faithful translation of the Node.js analyzeSentiment() function.
     */
    public SentimentResult analyzeSentiment(String text) {
        String lower = text.toLowerCase();

        int urgencyScore = 0;
        int sentimentScore = 0;

        for (String w : URGENT_WORDS) {
            if (lower.contains(w)) urgencyScore += 2;
        }
        for (String w : NEGATIVE_WORDS) {
            if (lower.contains(w)) sentimentScore -= 1;
        }
        for (String w : POSITIVE_WORDS) {
            if (lower.contains(w)) sentimentScore += 1;
        }

        // Exclamation marks (capped at 3)
        long exclamations = text.chars().filter(c -> c == '!').count();
        urgencyScore += (int) Math.min(exclamations, 3);

        // Caps ratio
        long upperCount = text.chars().filter(Character::isUpperCase).count();
        double capsRatio = (double) upperCount / Math.max(text.length(), 1);
        if (capsRatio > 0.4) urgencyScore += 2;

        // Priority
        String priority;
        if (urgencyScore >= 6) priority = "CRITICAL";
        else if (urgencyScore >= 4) priority = "HIGH";
        else if (urgencyScore >= 2) priority = "MEDIUM";
        else priority = "LOW";

        // Sentiment
        String sentiment;
        if (sentimentScore <= -2) sentiment = "NEGATIVE";
        else if (sentimentScore >= 2) sentiment = "POSITIVE";
        else sentiment = "NEUTRAL";

        String predictedCat = predictCategory(text);

        // Strategy key
        String strategyKey;
        if ("CRITICAL".equals(priority)) strategyKey = "CRITICAL";
        else if ("HIGH".equals(priority) && "NEGATIVE".equals(sentiment)) strategyKey = "NEGATIVE_HIGH";
        else if ("HIGH".equals(priority)) strategyKey = "HIGH";
        else if ("NEGATIVE".equals(sentiment)) strategyKey = "NEGATIVE";
        else if ("POSITIVE".equals(sentiment)) strategyKey = "POSITIVE";
        else strategyKey = "NEUTRAL";

        String strategy = pick(STRATEGIES.getOrDefault(strategyKey, STRATEGIES.get("NEUTRAL")));

        // Dynamic tips
        List<String> tips = new ArrayList<>();
        if (lower.contains("refund") || lower.contains("money"))
            tips.add("💡 Tip: Check refund policy before responding.");
        if (lower.contains("password") || lower.contains("locked"))
            tips.add("💡 Tip: Verify identity before resetting credentials.");
        if (lower.contains("deadline") || lower.contains("exam"))
            tips.add("💡 Tip: Time-sensitive academic issue — act quickly.");
        if (lower.contains("certificate") || lower.contains("diploma"))
            tips.add("💡 Tip: May require coordination with the certifications team.");
        if (lower.contains("not working") || lower.contains("broken"))
            tips.add("💡 Tip: Request browser/device info for debugging.");

        String tipLine = tips.isEmpty() ? "" : "\n\n" + String.join("\n", tips);

        // Draft response — use first 8 words as subject snippet
        String[] words = text.split("\\s+");
        String subjectSnippet = String.join(" ", Arrays.copyOfRange(words, 0, Math.min(8, words.length)));
        String aiDraft = generateDraftResponse(priority, sentiment, predictedCat, subjectSnippet);

        String summary = extractSummary(text);
        String suggestedResponse = String.format(
                "🎯 Summary: \"%s\"\n\n🤖 AI Strategy: %s%s\n\n📝 AI Draft Response: \"%s\"",
                summary, strategy, tipLine, aiDraft
        );

        return new SentimentResult(priority, sentiment, urgencyScore, sentimentScore,
                suggestedResponse, predictedCat, aiDraft);
    }

    /**
     * Generate a draft response from pools of greetings/actions/urgency/closing lines.
     */
    public String generateDraftResponse(String priority, String sentiment, String category, String subject) {
        String subjectSnippet = (subject != null ? subject : "your issue");
        if (subjectSnippet.length() > 60) subjectSnippet = subjectSnippet.substring(0, 60);

        List<String> greetingPool = GREETINGS.getOrDefault(sentiment, GREETINGS.get("NEUTRAL"));
        String greeting = String.format(pick(greetingPool), subjectSnippet);

        List<String> actionPool = CATEGORY_ACTIONS.getOrDefault(category, CATEGORY_ACTIONS.get("General"));
        String action = pick(actionPool);

        List<String> urgencyPool = URGENCY_LINES.getOrDefault(priority, URGENCY_LINES.get("LOW"));
        String urgency = pick(urgencyPool);

        String closing = pick(CLOSINGS);

        return greeting + " " + action + " " + urgency + " " + closing;
    }

    /**
     * Calculate SLA deadline by adding maxHours to fromDate.
     */
    public LocalDateTime calculateSLADeadline(String priority, LocalDateTime fromDate) {
        SlaConfig config = SLA_CONFIG.getOrDefault(priority, SLA_CONFIG.get("LOW"));
        return fromDate.plusHours(config.maxHours());
    }

    public LocalDateTime calculateSLADeadline(String priority) {
        return calculateSLADeadline(priority, LocalDateTime.now());
    }

    /**
     * Validate a state-machine transition.
     */
    public boolean validateTransition(String fromStatus, String toStatus) {
        List<String> allowed = VALID_TRANSITIONS.getOrDefault(fromStatus, List.of());
        return allowed.contains(toStatus);
    }

    /**
     * Auto-assign agent email by category.
     */
    public String assignAgent(String category) {
        return AGENT_ASSIGNMENTS.getOrDefault(category, AGENT_ASSIGNMENTS.get("General"));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Set<String> tokenize(String text) {
        // Extract word tokens (alphanumeric), lowercase
        return Arrays.stream(text.toLowerCase().split("[^\\w]+"))
                .filter(s -> !s.isBlank())
                .collect(Collectors.toSet());
    }

    private <T> T pick(List<T> list) {
        if (list == null || list.isEmpty()) throw new IllegalArgumentException("Cannot pick from empty list");
        return list.get(ThreadLocalRandom.current().nextInt(list.size()));
    }
}
