package com.moneycontrol.api.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String description;

    @NotNull
    @Positive(message = "Amount must be greater than zero")
    private BigDecimal amount;

    @NotNull
    private LocalDateTime date;

    @Enumerated(EnumType.STRING)
    @NotNull
    private TransactionType type;

    @ManyToOne
    @JoinColumn(name = "category_id")
    @JsonIgnoreProperties({"transactions"})
    private Category category;

    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({"transactions", "goals", "password", "authorities"})
    private User user;

    public enum TransactionType {
        INCOME, EXPENSE
    }
}
