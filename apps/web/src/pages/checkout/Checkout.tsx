import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { plans as marketingPlans } from '@/config/site';
import { useAuth } from '@/hooks/useAuth';
import { createCheckout, confirmPayment, listPlans, validateCoupon } from '@/lib/checkout';
import type { ApiError, CheckoutPlan, CheckoutResponse, CouponValidationResponse } from '@/types';

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

function usePlanCode(): string | null {
  const loc = useLocation();
  return new URLSearchParams(loc.search).get('plan');
}

/** INR paise → "₹1,499". Falls back to the raw number if Intl misbehaves. */
function inrFromPaise(paise: number): string {
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(paise / 100);
  } catch {
    return `₹${paise / 100}`;
  }
}

export default function Checkout() {
  const nav = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const planCode = usePlanCode();
  const location = useLocation();

  if (!isAuthenticated) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/auth/login?next=${next}`} replace />;
  }

  if (user && user.role !== 'PARENT') {
    return (
      <div className="wrap py-20 max-w-lg">
        <h1 className="mb-4">Only parents can buy a plan</h1>
        <p className="text-ink-soft mb-6">
          You&apos;re signed in as a {user.role.toLowerCase()}. Ask a parent to sign in and pay,
          then they can add you as a student.
        </p>
        <Link to="/portal/dashboard" className="btn">Back to portal</Link>
      </div>
    );
  }

  const [serverPlans, setServerPlans] = useState<CheckoutPlan[] | null>(null);
  const [order, setOrder] = useState<CheckoutResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [paying, setPaying] = useState(false);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [couponResult, setCouponResult] = useState<CouponValidationResponse | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  useEffect(() => {
    listPlans()
      .then(setServerPlans)
      .catch((err: ApiError) => setError(err.message ?? 'Could not load plans.'));
  }, []);

  const serverPlan = serverPlans?.find((p) => p.code === planCode);
  const marketing = marketingPlans.find((p) => p.code === planCode);

  if (!planCode) {
    return (
      <div className="wrap py-16 max-w-2xl">
        <h1 className="mb-6">Pick a plan</h1>
        <ul className="space-y-3">
          {marketingPlans.map((p) => (
            <li key={p.code}>
              <Link
                to={`/checkout?plan=${p.code}`}
                className="block p-5 bg-paper-warm border border-ink/10 rounded-md hover:border-ink/30 transition-all"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-display font-bold text-ink text-lg">{p.name}</div>
                    <div className="text-ink-soft text-sm">{p.whoFor}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-blue font-display font-extrabold text-xl">{p.price}</div>
                    {p.mrp && <div className="text-xs text-ink-faint line-through">{p.mrp}</div>}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (serverPlans && !serverPlan) {
    return (
      <div className="wrap py-20 max-w-lg">
        <h1 className="mb-4">Unknown plan</h1>
        <p className="text-ink-soft mb-6">
          The plan code &ldquo;{planCode}&rdquo; isn&apos;t in our catalog.
        </p>
        <Link to="/pricing" className="btn">See plans</Link>
      </div>
    );
  }

  async function handleApplyCoupon(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!couponCode.trim() || !planCode) return;
    setCouponLoading(true);
    setError(null);
    try {
      const res = await validateCoupon(couponCode, planCode);
      setCouponResult(res);
      if (!res.valid) {
        setError(res.message);
      }
    } catch {
      setError('Could not validate coupon.');
    } finally {
      setCouponLoading(false);
    }
  }

  async function startCheckout() {
    if (!planCode) return;
    setBusy(true);
    setError(null);
    try {
      const created = await createCheckout(planCode, couponResult?.valid ? couponResult.couponCode : couponCode);
      setOrder(created);

      // Trigger Razorpay Modal SDK automatically if provider is RAZORPAY
      if (created.provider === 'RAZORPAY' && created.providerOrderId) {
        launchRazorpayModal(created);
      }
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.message ?? 'Could not start checkout.');
    } finally {
      setBusy(false);
    }
  }

  function launchRazorpayModal(ord: CheckoutResponse) {
    if (!window.Razorpay) {
      setError('Razorpay SDK failed to load. Please check network connection.');
      return;
    }

    const keyId = ord.razorpayKeyId || import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_SdnoEPzzl0YrDQ';

    const options = {
      key: keyId,
      amount: ord.amountPaise,
      currency: ord.currency || 'INR',
      name: 'RedPen',
      description: `Payment for ${marketing?.name ?? ord.planCode}`,
      order_id: ord.providerOrderId,
      prefill: {
        email: user?.email ?? '',
        name: user?.fullName ?? '',
      },
      theme: {
        color: '#2C5FF6',
      },
      handler: async function (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) {
        setPaying(true);
        try {
          await confirmPayment(ord.orderId, response.razorpay_payment_id, response.razorpay_signature);
          nav('/checkout/add-student', { replace: true });
        } catch (err) {
          const apiErr = err as ApiError;
          setError(apiErr.message ?? 'Payment confirmation failed.');
        } finally {
          setPaying(false);
        }
      },
      modal: {
        ondismiss: function () {
          setPaying(false);
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  }

  async function payFallback() {
    if (!order) return;
    if (order.provider === 'RAZORPAY') {
      launchRazorpayModal(order);
      return;
    }

    setPaying(true);
    setError(null);
    try {
      const fakeProviderPaymentId = `stub_pay_${Date.now()}`;
      await confirmPayment(order.orderId, fakeProviderPaymentId);
      nav('/checkout/add-student', { replace: true });
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.message ?? 'Payment failed. Try again.');
    } finally {
      setPaying(false);
    }
  }

  const basePricePaise = serverPlan?.amountPaise ?? 0;
  const mrpPaise = serverPlan?.mrpPaise ?? 0;
  const finalPricePaise = couponResult?.valid ? couponResult.finalAmountPaise : basePricePaise;

  return (
    <div className="wrap py-16 max-w-xl">
      <p className="pen text-2xl mb-2">checkout</p>
      <h1 className="mb-6">{marketing?.name ?? serverPlan?.name ?? planCode}</h1>

      {/* Pricing summary card */}
      <div className="p-6 rounded-md bg-paper-warm border-2 border-ink/10 mb-6 space-y-3">
        <div className="flex justify-between items-baseline">
          <div>
            <span className="text-ink font-bold text-lg">{marketing?.name ?? serverPlan?.name}</span>
            <p className="text-ink-soft text-sm mt-0.5">{marketing?.per}</p>
          </div>
          <div className="text-right">
            <span className="font-display font-extrabold text-2xl text-ink">
              {inrFromPaise(finalPricePaise)}
            </span>
            {mrpPaise > 0 && (
              <span className="block text-xs text-ink-faint line-through">
                MRP {inrFromPaise(mrpPaise)}
              </span>
            )}
          </div>
        </div>

        {/* Coupon Discount breakdown */}
        {couponResult?.valid && (
          <div className="pt-2 border-t border-ink/10 flex justify-between text-sm text-green font-medium">
            <span>Coupon applied ({couponResult.couponCode} — {couponResult.discountPercent}% OFF)</span>
            <span>-{inrFromPaise(couponResult.discountAmountPaise)}</span>
          </div>
        )}
      </div>

      {/* Coupon code input field */}
      {!order && (
        <form onSubmit={handleApplyCoupon} className="mb-6 flex gap-2">
          <input
            type="text"
            placeholder="Coupon code (e.g. WISH10, WISH15)"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            className="flex-1 px-4 py-2 border border-ink/20 rounded-md text-sm uppercase font-mono tracking-wider focus:outline-none focus:border-blue"
          />
          <button
            type="submit"
            disabled={couponLoading || !couponCode.trim()}
            className="btn btn-secondary text-sm px-4"
          >
            {couponLoading ? 'Applying…' : 'Apply'}
          </button>
        </form>
      )}

      {error && (
        <p className="text-pen mb-4 text-sm font-medium" role="alert">
          {error}
        </p>
      )}

      {!order ? (
        <button
          onClick={startCheckout}
          disabled={busy || !serverPlan}
          className="btn btn-primary w-full justify-center text-lg py-3"
        >
          {busy ? 'Preparing Razorpay Checkout…' : `Pay ${inrFromPaise(finalPricePaise)}`}
        </button>
      ) : (
        <>
          <p className="text-ink-soft text-sm mb-3">
            Order <span className="font-mono">{order.orderId.slice(0, 8)}</span> ready.
            {order.provider === 'STUB' && (
              <span className="block mt-1 text-ink-faint">
                (Dev mode — click below to complete stub test payment.)
              </span>
            )}
          </p>
          <button onClick={payFallback} disabled={paying} className="btn btn-primary w-full justify-center text-lg py-3">
            {paying ? 'Processing…' : `Pay ${inrFromPaise(order.amountPaise)} with Razorpay`}
          </button>
        </>
      )}

      <p className="text-xs text-ink-faint mt-6 text-center">
        Signed in as {user?.email}. Not you? <Link to="/auth/login" className="underline">Switch account</Link>.
      </p>
    </div>
  );
}
