'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Star } from 'lucide-react'
import { submitRating } from '@/app/actions/ratings'
import { toast } from 'sonner'

interface RatingFormProps {
    rideId: string
    ratedUserId: string
    ratedUserName: string
    onSuccess?: () => void
}

export function RatingForm({ rideId, ratedUserId, ratedUserName, onSuccess }: RatingFormProps) {
    const [rating, setRating] = useState(0)
    const [hoveredRating, setHoveredRating] = useState(0)
    const [review, setReview] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (rating === 0) {
            toast.error('Please select a rating')
            return
        }

        setIsSubmitting(true)
        const formData = new FormData()
        formData.append('rideId', rideId)
        formData.append('ratedUserId', ratedUserId)
        formData.append('rating', rating.toString())
        if (review.trim()) {
            formData.append('review', review.trim())
        }

        const result = await submitRating(formData)

        if (result.success) {
            toast.success('Rating submitted successfully!')
            setRating(0)
            setReview('')
            onSuccess?.()
        } else {
            toast.error(result.error || 'Failed to submit rating')
        }

        setIsSubmitting(false)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Rate {ratedUserName}</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Star Rating */}
                    <div className="flex gap-2 justify-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoveredRating(star)}
                                onMouseLeave={() => setHoveredRating(0)}
                                className="transition-transform hover:scale-110"
                            >
                                <Star
                                    className={`h-8 w-8 ${star <= (hoveredRating || rating)
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'text-gray-300'
                                        }`}
                                />
                            </button>
                        ))}
                    </div>

                    {/* Review Text */}
                    <div>
                        <Textarea
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                            placeholder="Share your experience (optional)"
                            maxLength={500}
                            rows={4}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            {review.length}/500 characters
                        </p>
                    </div>

                    {/* Submit Button */}
                    <Button type="submit" className="w-full" disabled={isSubmitting || rating === 0}>
                        {isSubmitting ? 'Submitting...' : 'Submit Rating'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
