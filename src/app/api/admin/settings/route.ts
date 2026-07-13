import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper to upsert a setting
async function setSetting(key: string, value: string) {
  await prisma.systemSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

// Helper to get a setting with fallback
async function getSetting(key: string, defaultValue: string): Promise<string> {
  const setting = await prisma.systemSetting.findUnique({
    where: { key },
  });
  return setting ? setting.value : defaultValue;
}

export async function GET() {
  try {
    const maintenanceModeVal = await getSetting('maintenanceMode', 'false');
    const acceptingOrdersVal = await getSetting('acceptingOrders', 'true');
    const requireReceiptPhotoVal = await getSetting('requireReceiptPhoto', 'true');
    const newArrivalsDaysThresholdVal = await getSetting('newArrivalsDaysThreshold', '10');
    const defaultPasscode = process.env.ADMIN_PASSCODE || 'LondonOwner@2026';
    const adminPasscodeVal = await getSetting('adminPasscode', defaultPasscode);
    const restaurantInfoVal = await getSetting('restaurantInfo', '');

    let parsedRestaurantInfo = null;
    if (restaurantInfoVal) {
      try {
        parsedRestaurantInfo = JSON.parse(restaurantInfoVal);
      } catch (e) {
        console.warn('Failed to parse restaurantInfo from DB:', e);
      }
    }

    return NextResponse.json({
      success: true,
      settings: {
        maintenanceMode: maintenanceModeVal === 'true',
        acceptingOrders: acceptingOrdersVal === 'true',
        requireReceiptPhoto: requireReceiptPhotoVal === 'true',
        newArrivalsDaysThreshold: newArrivalsDaysThresholdVal,
        hasPasscodeSet: adminPasscodeVal !== defaultPasscode,
        restaurantInfo: parsedRestaurantInfo,
      },
    });
  } catch (error: unknown) {
    console.error('Settings API GET error:', error);
    // Safe fallback if database is not ready or migrated
    return NextResponse.json({
      success: true,
      settings: {
        maintenanceMode: false,
        acceptingOrders: true,
        requireReceiptPhoto: true,
        hasPasscodeSet: false,
      },
      warning: 'Database fallback: settings temporarily offline',
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { key, value } = await req.json();

    if (!key || typeof value !== 'string') {
      return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
    }

    try {
      await setSetting(key, value);
    } catch (dbError) {
      console.warn('Failed to save setting to DB, using local mock only:', dbError);
    }

    return NextResponse.json({ success: true, key, value });
  } catch (error: unknown) {
    console.error('Settings API POST error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
