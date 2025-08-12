
const LEMON_SQUEEZY_API_URL = 'https://api.lemonsqueezy.com/v1'
const LEMON_SQUEEZY_STORE_ID = '106685' // Replace with your actual store ID
const LEMON_SQUEEZY_API_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI5NGZjNjU5NS04NzA2LTQ3MDItODQxMS1mMjk0Y2M4MmQ4MDIiLCJqdGkiOiI1ZGY0OGI5Nzk1NGNhYzFiNjkyOGNjMDNlYTQ4MWQ5Y2EyYjJlMWIzNjc0ZGVkY2I5MjkyZGZjNTczMWRiZTk0NjQ3NDI5ZGJiYmIzMjIzNSIsImlhdCI6MTczNDU0MTY0Ni43MjM2MSwibmJmIjoxNzM0NTQxNjQ2LjcyMzYxMywiZXhwIjoyMDUwMDc0NDQ2LjcxNTA0Miwic3ViIjoiMjc5OTQyNyIsInNjb3BlcyI6W119.HbEgxJP5-G1oZhF80BmWCjNMJ2J0bZVAOSZTAmKhWpCBYZ9e8YAfmdIzOy15qQVm8tZqesBZGzEgvTOFhFNwseCKE4g_8_QlCmb2k4dv5Z_OaRDrM-1L-Rt5_WdSj4o8jJnYrWwXGjPQ9vXqU2nFs-7q6sJX1HdGQ8uCp2ZxZwWE4dPlzT6xR4eJmUdY0K7gDqVzh2X4OdF2O-7AKjvAkSSdObMeOPQN7fQBeCp1E6jfO-8tYYu1yQP2p2N3CJBUrWhMhJnEqeE9FYmT6o4s3nrw1hn3iKgZeLz-7VnwT8wB6Jc8N9lEqXJ1uPQHcgJV8dM9lEVg4D6p9c3A_g' // Test API key

export interface CheckoutSession {
  id: string
  attributes: {
    url: string
    expires_at: string
  }
}

export interface LemonSqueezyProduct {
  id: string
  attributes: {
    name: string
    price: number
    description: string
  }
}

export const lemonSqueezyService = {
  async createCheckoutSession(
    variantId: string,
    userId: string,
    userEmail: string,
    redirectUrl: string = `${window.location.origin}/dashboard`
  ): Promise<CheckoutSession> {
    const response = await fetch(`${LEMON_SQUEEZY_API_URL}/checkouts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LEMON_SQUEEZY_API_KEY}`,
        'Content-Type': 'application/vnd.api+json',
        'Accept': 'application/vnd.api+json',
      },
      body: JSON.stringify({
        data: {
          type: 'checkouts',
          attributes: {
            checkout_options: {
              embed: false,
              media: true,
              logo: true,
            },
            checkout_data: {
              email: userEmail,
              custom: {
                user_id: userId,
              },
            },
            product_options: {
              enabled_variants: [variantId],
              redirect_url: redirectUrl,
              receipt_button_text: 'Go to Dashboard',
              receipt_thank_you_note: 'Thanks for upgrading to Churnaizer!',
            },
            test_mode: true, // Always true for test mode
          },
          relationships: {
            store: {
              data: {
                type: 'stores',
                id: LEMON_SQUEEZY_STORE_ID,
              },
            },
            variant: {
              data: {
                type: 'variants',
                id: variantId,
              },
            },
          },
        },
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Lemon Squeezy error:', error)
      throw new Error(`Failed to create checkout session: ${response.statusText}`)
    }

    const result = await response.json()
    return result.data
  },

  async getProducts(): Promise<LemonSqueezyProduct[]> {
    const response = await fetch(`${LEMON_SQUEEZY_API_URL}/products?filter[store_id]=${LEMON_SQUEEZY_STORE_ID}`, {
      headers: {
        'Authorization': `Bearer ${LEMON_SQUEEZY_API_KEY}`,
        'Accept': 'application/vnd.api+json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.statusText}`)
    }

    const result = await response.json()
    return result.data
  },

  // Test mode variant IDs - Replace with your actual Lemon Squeezy variant IDs
  getVariantId(planSlug: string, billingCycle: 'monthly' | 'yearly'): string {
    const variants = {
      pro: {
        monthly: '123456', // Replace with actual variant ID for Pro Monthly
        yearly: '123457',  // Replace with actual variant ID for Pro Yearly
      },
      growth: {
        monthly: '123458', // Replace with actual variant ID for Growth Monthly
        yearly: '123459',  // Replace with actual variant ID for Growth Yearly
      },
    }

    return variants[planSlug as keyof typeof variants]?.[billingCycle] || ''
  }
}
