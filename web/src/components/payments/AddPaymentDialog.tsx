'use client'

import { useState, useTransition, ReactNode } from 'react'
import { addPaymentMethod } from '@/app/actions/payments'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

export function AddPaymentDialog({ children }: { children: ReactNode }) {
    const [open, setOpen] = useState(false)
    const [type, setType] = useState<'card' | 'upi' | 'wallet'>('upi')
    const [details, setDetails] = useState('')
    const [isPending, startTransition] = useTransition()

    const handleSubmit = () => {
        if (!details.trim()) {
            toast.error('Please enter details')
            return
        }

        startTransition(async () => {
            const result = await addPaymentMethod(type, details)
            if (result.success) {
                toast.success(result.message)
                setOpen(false)
                setDetails('')
            } else {
                toast.error('Failed to add payment method')
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Payment Method</DialogTitle>
                    <DialogDescription>
                        Add a new payment method for your rides.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Type</Label>
                        <Select value={type} onValueChange={(v) => setType(v as any)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="upi">UPI</SelectItem>
                                <SelectItem value="card">Credit/Debit Card</SelectItem>
                                <SelectItem value="wallet">Wallet</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>
                            {type === 'upi' ? 'UPI ID' : type === 'card' ? 'Card Number' : 'Wallet Provider'}
                        </Label>
                        <Input
                            placeholder={
                                type === 'upi'
                                    ? 'yourname@upi'
                                    : type === 'card'
                                        ? '4242 4242 4242 4242'
                                        : 'Paytm, PhonePe, etc.'
                            }
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isPending}>
                        {isPending ? 'Adding...' : 'Add Method'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
