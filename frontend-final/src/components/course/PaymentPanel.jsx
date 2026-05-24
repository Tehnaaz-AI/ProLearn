import { Detail } from "../ui/Detail";

export function PaymentPanel({ payment }) {
    return (
        <div className="panel">
            <h2 className="section-title">Payment confirmation</h2>
            <div className="space-y-2">
                <Detail label="Order ID" value={payment.order_id} />
                <Detail label="Amount" value={`INR ${payment.amount}`} />
                <Detail label="Date" value={new Date(payment.created_at || Date.now()).toLocaleString()} />
            </div>
        </div>
    );
}
