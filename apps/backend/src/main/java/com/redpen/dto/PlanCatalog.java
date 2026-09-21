package com.redpen.dto;

import java.util.List;
import java.util.Optional;

/**
 * Static plan catalog for RedPen paper bundles.
 */
public final class PlanCatalog {

    public record Plan(
            String code,
            String name,
            String description,
            int paperCount,
            int maxStudents,
            long amountPaise,
            long mrpPaise,
            int validityDays
    ) {}

    private static final List<Plan> PLANS = List.of(
            new Plan("FIVE_PAPERS", "5 Papers Bundle", "5 full board papers, evaluated against official CBSE marking scheme.", 5, 1, 59900, 74900, 365),
            new Plan("TWELVE_PAPERS", "12 Papers Bundle", "12 full board papers across subjects, step-by-step feedback.", 12, 2, 109900, 129900, 365),
            new Plan("TWENTY_PAPERS", "20 Papers Bundle", "20 full board papers, maximum practice & complete board readiness.", 20, 2, 199900, 249900, 365),
            
            // Backward-compatibility aliases for legacy code references
            new Plan("ONE_SUBJECT", "5 Papers Bundle", "5 full board papers, evaluated against official CBSE marking scheme.", 5, 1, 59900, 74900, 365),
            new Plan("THREE_SUBJECTS", "12 Papers Bundle", "12 full board papers across subjects, step-by-step feedback.", 12, 2, 109900, 129900, 365),
            new Plan("ALL_SUBJECTS", "20 Papers Bundle", "20 full board papers, maximum practice & complete board readiness.", 20, 2, 199900, 249900, 365)
    );

    private PlanCatalog() {}

    public static List<Plan> all() {
        return List.of(PLANS.get(0), PLANS.get(1), PLANS.get(2));
    }

    public static Optional<Plan> byCode(String code) {
        if (code == null) return Optional.empty();
        return PLANS.stream().filter(p -> p.code().equalsIgnoreCase(code)).findFirst();
    }
}
