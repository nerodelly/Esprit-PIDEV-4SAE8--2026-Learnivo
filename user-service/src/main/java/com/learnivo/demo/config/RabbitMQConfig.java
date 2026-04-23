package com.learnivo.demo.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String CLAIMS_QUEUE = "claims.queue";
    public static final String CLAIMS_EXCHANGE = "claims.exchange";
    public static final String CLAIMS_ROUTING_KEY = "claim.created";

    @Bean
    public Queue claimsQueue() {
        return new Queue(CLAIMS_QUEUE, true);
    }

    @Bean
    public TopicExchange claimsExchange() {
        return new TopicExchange(CLAIMS_EXCHANGE);
    }

    @Bean
    public Binding bindingClaims(Queue claimsQueue, TopicExchange claimsExchange) {
        return BindingBuilder.bind(claimsQueue).to(claimsExchange).with(CLAIMS_ROUTING_KEY);
    }
}
