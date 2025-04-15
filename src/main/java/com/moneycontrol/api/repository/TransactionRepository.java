package com.moneycontrol.api.repository;

import com.moneycontrol.api.model.Transaction;
import com.moneycontrol.api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByUser(User user);
    List<Transaction> findByUserAndDateBetween(User user, LocalDateTime start, LocalDateTime end);
    List<Transaction> findByUserAndType(User user, Transaction.TransactionType type);
    List<Transaction> findByUserAndCategoryId(User user, Long categoryId);
}
