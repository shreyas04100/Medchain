package com.medchain.util;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;

public final class DateTimeUtil {

    private DateTimeUtil() {}

    public static OffsetDateTime now() {
        return Instant.now().atOffset(ZoneOffset.UTC);
    }
}
