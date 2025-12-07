'use client'

import { PaymentMethod, setDefaultPaymentMethod, removePaymentMethod } from '@/app/actions/payments'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CreditCard, Smartphone, Wallet, Star, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useTransition } from 'react'

const iconMap = {
    card: CreditCard,
    upi: Smartphone,
    wallet: Wallet,
}

export function PaymentMethodCard({ method }: { method: PaymentMethod }) {
    const [isPending, startTransition] = useTransition()
    const Icon = iconMap[method.type]

    const handleSetDefault = () => {
        startTransition(async () => {
            const result = await setDefaultPaymentMethod(method.id)
            if (result.success) {
                toast.success(result.message)
            } else {
                toast.error('Failed to set default')
            }
        })
    }

    const handleRemove = () => {
        startTransition(async () => {
            const result = await removePaymentMethod(method.id)
            if (result.success) {
                toast.success(result.message)
            } else {
                toast.error('Failed to remove')
            }
        })
    }

    return (
        <Card className={method.isDefault ? 'border-primary' : ''}>
            <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-muted rounded-lg">
                        <Icon className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="font-medium">{method.label}</p>
                        {method.last4 && (
                            <p className="text-sm text-muted-foreground">•••• {method.last4}</p>
                        )}
                    </div>
                    {method.isDefault && (
                        <span className="flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">
                            <Star className="h-3 w-3" /> Default
                        </span>
                    )}
                </div>
                <div className="flex gap-2">
                    {!method.isDefault && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSetDefault}
                            disabled={isPending}
                        >
                            Set Default
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleRemove}
                        disabled={isPending}
                        className="text-destructive hover:text-destructive"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
