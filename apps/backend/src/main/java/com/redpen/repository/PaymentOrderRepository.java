package com.redpen.repository;

import com.redpen.entity.OrderStatus;
import com.redpen.entity.PaymentOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentOrderRepository extends JpaRepository<PaymentOrder, String> {
    List<PaymentOrder> findByParentUserIdOrderByCreatedAtDesc(String parentUserId);

    Optional<PaymentOrder> findByProviderOrderId(String providerOrderId);

    List<PaymentOrder> findByStatus(OrderStatus status);
}
