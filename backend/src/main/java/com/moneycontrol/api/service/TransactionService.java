package com.moneycontrol.api.service;

import com.moneycontrol.api.dto.TransactionDto;
import com.moneycontrol.api.exception.ResourceNotFoundException;
import com.moneycontrol.api.model.Category;
import com.moneycontrol.api.model.Transaction;
import com.moneycontrol.api.model.User;
import com.moneycontrol.api.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserService userService;
    private final CategoryService categoryService;

    public List<Transaction> getAllTransactionsByUser(String email) {
        User user = userService.getCurrentUser(email);
        return transactionRepository.findByUser(user);
    }

    public Transaction getTransactionById(Long id, String email) {
        User user = userService.getCurrentUser(email);
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + id));
        
        if (!transaction.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Transaction does not belong to the current user");
        }
        
        return transaction;
    }

    public Transaction createTransaction(TransactionDto transactionDto, String email) {
        User user = userService.getCurrentUser(email);
        Category category = categoryService.getCategoryById(transactionDto.getCategoryId());
        
        Transaction transaction = new Transaction();
        transaction.setDescription(transactionDto.getDescription());
        transaction.setAmount(transactionDto.getAmount());
        transaction.setDate(transactionDto.getDate());
        transaction.setType(transactionDto.getType());
        transaction.setCategory(category);
        transaction.setUser(user);
        
        return transactionRepository.save(transaction);
    }

    public Transaction updateTransaction(Long id, TransactionDto transactionDto, String email) {
        Transaction transaction = getTransactionById(id, email);
        Category category = categoryService.getCategoryById(transactionDto.getCategoryId());
        
        transaction.setDescription(transactionDto.getDescription());
        transaction.setAmount(transactionDto.getAmount());
        transaction.setDate(transactionDto.getDate());
        transaction.setType(transactionDto.getType());
        transaction.setCategory(category);
        
        return transactionRepository.save(transaction);
    }

    public void deleteTransaction(Long id, String email) {
        Transaction transaction = getTransactionById(id, email);
        transactionRepository.delete(transaction);
    }

    public List<Transaction> getTransactionsByDateRange(LocalDateTime start, LocalDateTime end, String email) {
        User user = userService.getCurrentUser(email);
        return transactionRepository.findByUserAndDateBetween(user, start, end);
    }

    public List<Transaction> getTransactionsByType(Transaction.TransactionType type, String email) {
        User user = userService.getCurrentUser(email);
        return transactionRepository.findByUserAndType(user, type);
    }

    public List<Transaction> getTransactionsByCategory(Long categoryId, String email) {
        User user = userService.getCurrentUser(email);
        return transactionRepository.findByUserAndCategoryId(user, categoryId);
    }
}
