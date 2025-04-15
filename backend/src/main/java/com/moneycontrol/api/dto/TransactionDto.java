package com.moneycontrol.api.dto;

import com.moneycontrol.api.model.Transaction;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class TransactionDto {
    
    private Long id;
    
    @NotBlank
    private String description;
    
    @NotNull
    @Positive(message = "Amount must be greater than zero")
    private BigDecimal amount;
    
    @NotNull
    private LocalDateTime date;
    
    @NotNull
    private Transaction.TransactionType type;
    
    @NotNull
    private Long categoryId;
}
