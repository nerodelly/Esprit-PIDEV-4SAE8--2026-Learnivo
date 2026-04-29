package com.learnivo.claimsservice.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    // Exchange
    public static final String EXCHANGE_NAME = "claims.exchange";

    // Queues
    public static final String QUEUE_AGENT = "claims.notifications.agent";
    public static final String QUEUE_USER  = "claims.notifications.user";

    // Routing keys
    public static final String ROUTING_CLAIM_CREATED   = "claim.created";
    public static final String ROUTING_STATUS_CHANGED  = "claim.status.changed";
    public static final String ROUTING_CLAIM_ASSIGNED  = "claim.assigned";
    public static final String ROUTING_CLAIM_ESCALATED = "claim.escalated";

    @Bean
    public TopicExchange claimsExchange() {
        return new TopicExchange(EXCHANGE_NAME, true, false);
    }

    @Bean
    public Queue agentQueue() {
        return new Queue(QUEUE_AGENT, true);
    }

    @Bean
    public Queue userQueue() {
        return new Queue(QUEUE_USER, true);
    }

    @Bean
    public Binding agentBinding(Queue agentQueue, TopicExchange claimsExchange) {
        return BindingBuilder.bind(agentQueue).to(claimsExchange).with(ROUTING_CLAIM_CREATED);
    }

    @Bean
    public Binding userBinding(Queue userQueue, TopicExchange claimsExchange) {
        return BindingBuilder.bind(userQueue).to(claimsExchange).with(ROUTING_STATUS_CHANGED);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter());
        return template;
    }
}
