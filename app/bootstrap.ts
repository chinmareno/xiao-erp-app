import { db } from "./lib/db.server";

async function bootstrap() {
  try {
    // TODO: Move API key to environment variable for security
    const response = await fetch("https://v6.exchangerate-api.com/v6/2d98c763ad409950e964a5b1/latest/USD");
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    const cny = result.conversion_rates.CNY;
    const idr = result.conversion_rates.IDR;
    
    const rate = await db.yuanIdrRate.create({
      data: {
        idrToYuanRate: cny / idr,
        yuanToIdrRate: idr / cny,
      },
    });
    
    console.log(rate);
  } catch (error) {
    console.error("Bootstrap failed:", error);
    throw error;
  }
}

bootstrap();
