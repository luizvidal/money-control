package com.moneycontrol.api.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class GoalDto {
    
    private Long id;
    
    @NotBlank
    private String name;
    
    private String description;
    
    @NotNull
    @Positive(message = "Target amount must be greater than zero")
    private BigDecimal targetAmount;
    
    @NotNull
    @Positive(message = "Current amount must be greater than zero")
    private BigDecimal currentAmount;
    
    @NotNull
    @Future(message = "Target date must be in the future")
    private LocalDate targetDate;
}
