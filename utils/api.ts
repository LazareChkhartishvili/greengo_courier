// API Service Layer for GreenGo Courier App
import { getApiInfo, getApiUrl } from "./apiConfig";

const API_BASE_URL = getApiUrl();

// Log API configuration on startup
console.log("🔧 API Configuration:", getApiInfo());

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    details: string;
  };
}

class ApiService {
  private errorLogCache = new Map<string, number>(); // Cache for error logging rate limiting

  private async fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeout = 30000 // Increased to 30 seconds
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.warn(`⏱️ Request timeout after ${timeout}ms: ${url}`);
      controller.abort();
    }, timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error: any) {
      clearTimeout(timeoutId);
      // Check if it's an abort error
      if (error.name === "AbortError" || error.message?.includes("Aborted")) {
        throw new Error(`Request timeout: ${url}`);
      }
      throw error;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      console.log(`🌐 API Request: ${options.method || "GET"} ${url}`);
      console.log(`📡 Full URL: ${url}`);
      console.log(`🔧 Base URL: ${API_BASE_URL}`);

      // Log request body for debugging
      if (options.body) {
        try {
          const bodyData =
            typeof options.body === "string"
              ? JSON.parse(options.body)
              : options.body;
          console.log(`📦 Request Body:`, JSON.stringify(bodyData, null, 2));
        } catch (e) {
          console.log(`📦 Request Body:`, options.body);
        }
      }

      const response = await this.fetchWithTimeout(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        // Rate limit error logging for 500 errors (log once per 30 seconds per endpoint)
        const errorKey = `${response.status}:${endpoint}`;
        const now = Date.now();
        const lastLogTime = this.errorLogCache.get(errorKey) || 0;
        const shouldLog = response.status !== 500 || now - lastLogTime > 30000;

        if (shouldLog) {
          console.error(
            `❌ API Error [${options.method || "GET"} ${endpoint}]: ${
              response.status
            }`
          );
          console.error(`📡 Failed URL: ${url}`);
          if (options.body) {
            try {
              const bodyData =
                typeof options.body === "string"
                  ? JSON.parse(options.body)
                  : options.body;
              console.error(
                `📦 Request Body that failed:`,
                JSON.stringify(bodyData, null, 2)
              );
            } catch (e) {
              console.error(`📦 Request Body that failed:`, options.body);
            }
          }
          console.error(`🔴 Error Response:`, JSON.stringify(data, null, 2));
          if (response.status === 500) {
            this.errorLogCache.set(errorKey, now);
          }
        }

        return {
          success: false,
          error: {
            code: `HTTP_${response.status}`,
            details:
              data.message ||
              data.error?.details ||
              data.error?.message ||
              "უცნობი შეცდომა",
          },
        };
      }

      console.log(`✅ API Success: ${endpoint}`, data);
      return {
        success: true,
        data: data.data || data,
        message: data.message,
      };
    } catch (error: unknown) {
      console.error(`❌ API Exception: ${endpoint}`, error);
      const errorMessage =
        error instanceof Error ? error.message : "Network request failed";
      return {
        success: false,
        error: {
          code: "NETWORK_ERROR",
          details: errorMessage,
        },
      };
    }
  }

  // Courier endpoints
  async getCourier(courierId: string): Promise<ApiResponse<any>> {
    return this.request(`/couriers/${courierId}`);
  }

  async findCourierByPhone(phoneNumber: string): Promise<ApiResponse<any>> {
    // Backend returns: { data: Courier[], total, page, limit }
    // When phoneNumber is provided, it returns: { data: [courier] or [], total: 1 or 0, page: 1, limit: 1 }
    // Use shorter timeout for this request (10 seconds)
    try {
      const url = `${API_BASE_URL}/couriers?phoneNumber=${encodeURIComponent(
        phoneNumber
      )}&limit=1`;
      console.log(`🌐 API Request: GET ${url}`);

      const response = await this.fetchWithTimeout(
        url,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
        10000
      ); // 10 seconds timeout

      const data = await response.json();

      if (!response.ok) {
        console.log(`⚠️ API Error: ${response.status}`, data);
        return {
          success: false,
          error: {
            code: `HTTP_${response.status}`,
            details: data.message || data.error?.details || "უცნობი შეცდომა",
          },
        };
      }

      console.log(`✅ API Success: /couriers?phoneNumber=...`, data);
      return {
        success: true,
        data: data.data || data,
        message: data.message,
      };
    } catch (error: unknown) {
      // Silently handle timeout - courier might not exist, so we'll try registration
      const errorMessage =
        error instanceof Error ? error.message : "Network request failed";

      if (errorMessage.includes("timeout")) {
        console.log(
          "⏱️ Request timeout - courier might not exist, will try registration"
        );
        return {
          success: false,
          error: {
            code: "TIMEOUT",
            details: "Request timeout",
          },
        };
      }

      console.log(`⚠️ API Exception: /couriers?phoneNumber=...`, errorMessage);
      return {
        success: false,
        error: {
          code: "NETWORK_ERROR",
          details: errorMessage,
        },
      };
    }
  }

  async sendVerificationCode(
    phoneNumber: string,
    countryCode?: string
  ): Promise<ApiResponse<{ code: string }>> {
    return this.request("/auth/send-verification-code", {
      method: "POST",
      body: JSON.stringify({ phoneNumber, countryCode }),
    });
  }

  async registerCourier(
    phoneNumber: string,
    verificationCode: string,
    name?: string
  ): Promise<ApiResponse<any>> {
    // Backend returns: Courier object directly
    return this.request("/couriers/register", {
      method: "POST",
      body: JSON.stringify({ phoneNumber, verificationCode, name }),
    });
  }

  async createCourier(courierData: {
    name: string;
    phoneNumber: string;
    email?: string;
    status?: "available" | "busy" | "offline";
    isAvailable?: boolean;
    currentLocation?: { latitude: number; longitude: number };
  }): Promise<ApiResponse<any>> {
    // Backend returns: Courier object directly
    return this.request("/couriers", {
      method: "POST",
      body: JSON.stringify(courierData),
    });
  }

  async updateCourierLocation(
    courierId: string,
    latitude: number,
    longitude: number
  ): Promise<ApiResponse<any>> {
    if (!courierId) {
      console.warn("⚠️ updateCourierLocation: courierId is missing");
      return {
        success: false,
        error: {
          code: "INVALID_INPUT",
          details: "Courier ID is required",
        },
      };
    }

    // Try Format 1: Update main courier endpoint with currentLocation (matches createCourier format)
    const response1 = await this.request(`/couriers/${courierId}`, {
      method: "PATCH",
      body: JSON.stringify({
        currentLocation: { latitude, longitude },
      }),
    });

    if (response1.success) {
      return response1;
    }

    // If Format 1 fails with 500, try Format 2: dedicated location endpoint with currentLocation
    if (response1.error?.code === "HTTP_500") {
      console.log(
        "🔄 Trying /location endpoint with currentLocation format..."
      );
      const response2 = await this.request(`/couriers/${courierId}/location`, {
        method: "PATCH",
        body: JSON.stringify({
          currentLocation: { latitude, longitude },
        }),
      });

      if (response2.success) {
        return response2;
      }

      // If still fails, try Format 3: direct latitude/longitude on location endpoint
      if (response2.error?.code === "HTTP_500") {
        console.log("🔄 Trying direct latitude/longitude format...");
        const response3 = await this.request(
          `/couriers/${courierId}/location`,
          {
            method: "PATCH",
            body: JSON.stringify({ latitude, longitude }),
          }
        );
        return response3;
      }

      return response2;
    }

    return response1;
  }

  async updateCourierStatus(
    courierId: string,
    status: "available" | "busy" | "offline",
    isAvailable: boolean
  ): Promise<ApiResponse<any>> {
    if (!courierId) {
      console.warn("⚠️ updateCourierStatus: courierId is missing");
      return {
        success: false,
        error: {
          code: "INVALID_INPUT",
          details: "Courier ID is required",
        },
      };
    }

    // Try Format 1: { status, isAvailable }
    const response1 = await this.request(`/couriers/${courierId}`, {
      method: "PATCH",
      body: JSON.stringify({ status, isAvailable }),
    });

    // If Format 1 fails with 500, try Format 2: { status } only
    if (!response1.success && response1.error?.code === "HTTP_500") {
      console.log("🔄 Trying alternative status format...");
      const response2 = await this.request(`/couriers/${courierId}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      return response2;
    }

    return response1;
  }

  // Order endpoints
  async getAvailableOrders(
    courierId: string,
    latitude: number,
    longitude: number
  ): Promise<ApiResponse<any[]>> {
    return this.request(
      `/orders?status=ready&limit=10&forCourier=${courierId}`
    );
  }

  async getCourierOrders(courierId: string): Promise<ApiResponse<any[]>> {
    try {
      // Try different endpoint formats that might work with your backend
      const endpoint = `/orders?courierId=${courierId}&limit=50`;
      console.log(`🔍 Fetching courier orders for: ${courierId}`);
      return await this.request(endpoint);
    } catch (error) {
      console.error(
        `❌ Error in getCourierOrders for courier ${courierId}:`,
        error
      );
      return {
        success: false,
        error: {
          code: "FETCH_ERROR",
          details:
            error instanceof Error
              ? error.message
              : "Failed to fetch courier orders",
        },
      };
    }
  }

  async getOrder(orderId: string): Promise<ApiResponse<any>> {
    return this.request(`/orders/${orderId}`);
  }

  async acceptOrder(
    orderId: string,
    courierId: string
  ): Promise<ApiResponse<any>> {
    return this.request(`/orders/${orderId}/assign-courier`, {
      method: "PATCH",
      body: JSON.stringify({ courierId }),
    });
  }

  async updateOrderStatus(
    orderId: string,
    status: string
  ): Promise<ApiResponse<any>> {
    return this.request(`/orders/${orderId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  }

  async completeOrder(
    orderId: string,
    courierId: string
  ): Promise<ApiResponse<any>> {
    // Update order status to delivered
    const statusResponse = await this.updateOrderStatus(orderId, "delivered");
    if (!statusResponse.success) {
      return statusResponse;
    }

    // Complete order in courier service
    return this.request(`/couriers/${courierId}/complete-order`, {
      method: "PATCH",
    });
  }

  async getCourierStatistics(
    courierId: string,
    period: "today" | "week" | "month" = "today"
  ): Promise<ApiResponse<any>> {
    return this.request(`/couriers/${courierId}/statistics?period=${period}`);
  }
}

export const apiService = new ApiService();
