package com.moneycontrol.api.controller;

import com.moneycontrol.api.dto.TransactionDto;
import com.moneycontrol.api.model.Transaction;
import com.moneycontrol.api.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @GetMapping
    public ResponseEntity<List<Transaction>> getAllTransactions(Authentication authentication) {
        return ResponseEntity.ok(transactionService.getAllTransactionsByUser(authentication.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Transaction> getTransactionById(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(transactionService.getTransactionById(id, authentication.getName()));
    }

    @PostMapping
    public ResponseEntity<Transaction> createTransaction(@Valid @RequestBody TransactionDto transactionDto, 
                                                        Authentication authentication) {
        return ResponseEntity.ok(transactionService.createTransaction(transactionDto, authentication.getName()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Transaction> updateTransaction(@PathVariable Long id, 
                                                        @Valid @RequestBody TransactionDto transactionDto,
                                                        Authentication authentication) {
        return ResponseEntity.ok(transactionService.updateTransaction(id, transactionDto, authentication.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTransaction(@PathVariable Long id, Authentication authentication) {
        transactionService.deleteTransaction(id, authentication.getName());
        return ResponseEntity.ok("Transaction deleted successfully");
    }

    @GetMapping("/date-range")
    public ResponseEntity<List<Transaction>> getTransactionsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
            Authentication authentication) {
        return ResponseEntity.ok(transactionService.getTransactionsByDateRange(start, end, authentication.getName()));
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<Transaction>> getTransactionsByType(
            @PathVariable Transaction.TransactionType type,
            Authentication authentication) {
        return ResponseEntity.ok(transactionService.getTransactionsByType(type, authentication.getName()));
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<Transaction>> getTransactionsByCategory(
            @PathVariable Long categoryId,
            Authentication authentication) {
        return ResponseEntity.ok(transactionService.getTransactionsByCategory(categoryId, authentication.getName()));
    }
}
