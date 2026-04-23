package com.learnivo.demo.dto.ticket;

import com.learnivo.demo.enums.TicketPriority;
import com.learnivo.demo.enums.TicketStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketUpdateDTO {
    private TicketStatus status;
    private TicketPriority priority;
}
