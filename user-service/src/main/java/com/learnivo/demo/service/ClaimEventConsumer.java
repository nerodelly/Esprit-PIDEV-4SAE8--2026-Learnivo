package com.learnivo.demo.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class ClaimEventConsumer {

    @RabbitListener(queues = "claims.queue")
    public void receiveClaimEvent(String claimMessage) {
        log.info("Received new Claim Event asynchronously from RabbitMQ: {}", claimMessage);
        // Here user-service can process the claim reference, send an internal notification,
        // log the interaction, or update user complaint metrics asynchronously.
    }
}
