import { getPaymentMethods } from '@/app/actions/payments'
import { PaymentMethodCard } from '@/components/payments/PaymentMethodCard'
import { AddPaymentDialog } from '@/components/payments/AddPaymentDialog'
import { Button } from '@/components/ui/button'
import { CreditCard, Plus } from 'lucide-react'

export default async function PaymentsPage() {
    const result = await getPaymentMethods()
    const methods = result.success ? result.methods : []

    return (
        <div className="container max-w-2xl py-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                    <h2 className="text-2xl font-bold tracking-tight">Payment Methods</h2>
                    <p className="text-muted-foreground">
                        Manage your payment options for rides.
                    </p>
                </div>
                <AddPaymentDialog>
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add New
                    </Button>
                </AddPaymentDialog>
            </div>

            <div className="space-y-4">
                {methods.length > 0 ? (
                    methods.map(method => (
                        <PaymentMethodCard key={method.id} method={method} />
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <CreditCard className="h-16 w-16 text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No payment methods</h3>
                        <p className="text-muted-foreground mb-4">
                            Add a payment method to start booking rides.
                        </p>
                        <AddPaymentDialog>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Payment Method
                            </Button>
                        </AddPaymentDialog>
                    </div>
                )}
            </div>
        </div>
    )
}
