package com.moneycontrol.api.repository;

import com.moneycontrol.api.model.Transaction;
import com.moneycontrol.api.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    Page<Transaction> findByUser(User user, Pageable pageable);
    List<Transaction> findByUser(User user);
    Page<Transaction> findByUserAndDateBetween(User user, LocalDateTime start, LocalDateTime end, Pageable pageable);
    List<Transaction> findByUserAndDateBetween(User user, LocalDateTime start, LocalDateTime end);
    Page<Transaction> findByUserAndType(User user, Transaction.TransactionType type, Pageable pageable);
    List<Transaction> findByUserAndType(User user, Transaction.TransactionType type);
    Page<Transaction> findByUserAndCategoryId(User user, Long categoryId, Pageable pageable);
    List<Transaction> findByUserAndCategoryId(User user, Long categoryId);
}
