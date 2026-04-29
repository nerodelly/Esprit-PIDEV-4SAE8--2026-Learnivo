package com.learnivo.claimsservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatsResponse {

    private long total;
    private long created;
    private long inProgress;
    private long resolved;
    private long closed;
    private long rejected;
    private long critical;
    private long escalated;
    private long slaBreached;
}
