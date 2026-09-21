import { useEffect, useState } from 'react';
import { fetchAdminPayments } from '@/lib/admin';
import type { AdminPaymentOrder } from '@/types';

export default function AdminPayments() {
  const [payments, setPayments] = useState<AdminPaymentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAdminPayments();
      setPayments(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load Razorpay payment ledger');
    } finally {
      setLoading(false);
    }
  };

  const totalRevenuePaise = payments
    .filter((p) => p.status === 'PAID')
    .reduce((acc, p) => acc + (p.finalAmountPaise || p.amountPaise || 0), 0);

  const totalRevenueRupees = (totalRevenuePaise / 100).toLocaleString('en-IN');
  const paidOrdersCount = payments.filter((p) => p.status === 'PAID').length;
  const couponOrdersCount = payments.filter((p) => p.appliedCoupon && p.status === 'PAID').length;

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-2xl">💳</span>
          <h1 className="text-2xl font-bold font-display text-ink">Razorpay Payment Ledger & Revenue</h1>
        </div>
        <p className="text-sm text-ink-soft mt-1">
          Real-time payment order transactions, webhook statuses, coupon discount tracking, and subscription plan billing.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-pen-soft border border-pen/20 text-pen rounded-lg flex items-center gap-3 text-sm">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-paper-warm p-5 rounded-xl border border-ink/10 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-mono text-ink-soft font-medium uppercase tracking-wider">Total Revenue</div>
            <div className="text-2xl font-bold font-display text-ink mt-1">₹{totalRevenueRupees}</div>
            <div className="text-[11px] text-success flex items-center gap-1 mt-1 font-medium">
              📈 Live Razorpay Transactions
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-wash text-accent flex items-center justify-center text-xl">
            📈
          </div>
        </div>

        <div className="bg-paper-warm p-5 rounded-xl border border-ink/10 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-mono text-ink-soft font-medium uppercase tracking-wider">Paid Orders</div>
            <div className="text-2xl font-bold font-display text-ink mt-1">{paidOrdersCount}</div>
            <div className="text-[11px] text-ink-soft mt-1 font-mono">
              Total created: {payments.length}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-green-50 text-success flex items-center justify-center text-xl">
            ✅
          </div>
        </div>

        <div className="bg-paper-warm p-5 rounded-xl border border-ink/10 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-mono text-ink-soft font-medium uppercase tracking-wider">Coupon Discount Usage</div>
            <div className="text-2xl font-bold font-display text-ink mt-1">{couponOrdersCount}</div>
            <div className="text-[11px] text-ink-soft mt-1 font-mono">
              WISH10 (10%) & WISH15 (15%)
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl">
            🎟️
          </div>
        </div>
      </div>

      {/* Payment Orders Table */}
      <div className="bg-paper-warm rounded-xl border border-ink/10 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-ink/10 flex items-center justify-between">
          <h2 className="font-semibold font-display text-ink">Transaction History</h2>
          <span className="text-xs px-2.5 py-1 bg-blue-wash text-accent rounded-full font-mono font-medium">
            {payments.length} Transactions
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-ink-soft flex items-center justify-center gap-2 text-sm">
            <span className="animate-spin text-lg">⏳</span>
            Loading transaction ledger...
          </div>
        ) : payments.length === 0 ? (
          <div className="p-12 text-center text-ink-soft">
            <div className="text-4xl mb-3">💳</div>
            <p className="font-medium text-ink">No payment transactions recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-paper text-ink-soft border-b border-ink/10 font-medium">
                <tr>
                  <th className="py-3.5 px-4">Razorpay Order ID</th>
                  <th className="py-3.5 px-4">Plan Name</th>
                  <th className="py-3.5 px-4">MRP / Final Amount</th>
                  <th className="py-3.5 px-4">Coupon</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Payment Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {payments.map((p) => {
                  const mrpRupees = p.amountPaise ? (p.amountPaise / 100).toFixed(0) : '0';
                  const finalRupees = p.finalAmountPaise ? (p.finalAmountPaise / 100).toFixed(0) : mrpRupees;
                  const orderIdDisplay = p.razorpayOrderId || p.providerOrderId || p.id;
                  const payIdDisplay = p.razorpayPaymentId || p.providerPaymentId;

                  return (
                    <tr key={p.id} className="hover:bg-paper/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-xs font-semibold text-ink">{orderIdDisplay}</div>
                        {payIdDisplay && (
                          <div className="text-[11px] font-mono text-ink-soft">
                            Pay ID: {payIdDisplay}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-xs text-ink">{p.planName || p.planCode}</span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-xs">
                        {p.appliedCoupon ? (
                          <div className="flex items-center gap-1.5">
                            <span className="line-through text-ink-faint">₹{mrpRupees}</span>
                            <span className="font-bold text-success">₹{finalRupees}</span>
                          </div>
                        ) : (
                          <span className="font-bold text-ink">₹{mrpRupees}</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {p.appliedCoupon ? (
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[11px] font-mono font-semibold">
                            {p.appliedCoupon}
                          </span>
                        ) : (
                          <span className="text-xs text-ink-faint italic">—</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {p.status === 'PAID' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-green-50 text-success border border-green-200 rounded-full text-xs font-mono font-semibold">
                            ✓ PAID
                          </span>
                        ) : p.status === 'FAILED' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-pen-soft text-pen border border-pen/20 rounded-full text-xs font-mono font-semibold">
                            ✕ FAILED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-mono font-semibold">
                            ⏱️ {p.status}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-xs text-ink-soft font-mono">
                        {new Date(p.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
