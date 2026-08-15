import { createClient } from '@supabase/supabase-js';
import { CompanySettings } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Upload branding file (logo or banner) to Supabase Storage.
 * Target Bucket: 'branding'
 * Returns the permanent public Storage URL.
 */
export async function uploadBrandingImageToSupabase(
  file: File,
  type: 'logo' | 'banner' | 'portal_logo' | 'portal_banner' | 'admin_avatar'
): Promise<string> {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type.toLowerCase())) {
    throw new Error('Invalid format. Only JPG, JPEG, PNG, and WebP files are allowed.');
  }

  if (!supabase) {
    throw new Error('Supabase configuration missing (VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not set).');
  }

  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'png';
  const fileName = `${type}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
  const bucketName = 'branding';

  // Attempt to upload file to Supabase storage bucket 'branding'
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type,
    });

  if (error) {
    console.warn('Supabase storage upload error, attempting bucket setup:', error);
    // If bucket does not exist, attempt to create it and retry upload
    if (error.message?.toLowerCase().includes('bucket not found') || (error as any).status === 404) {
      try {
        await supabase.storage.createBucket(bucketName, { public: true });
        const retry = await supabase.storage.from(bucketName).upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type,
        });
        if (retry.error) throw retry.error;
      } catch (bucketErr) {
        console.error('Bucket creation/retry error:', bucketErr);
        throw error;
      }
    } else {
      throw error;
    }
  }

  // Retrieve permanent public URL from Supabase Storage
  const { data: publicUrlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(fileName);

  if (!publicUrlData || !publicUrlData.publicUrl) {
    throw new Error('Failed to retrieve permanent public URL from Supabase Storage.');
  }

  return publicUrlData.publicUrl;
}

/**
 * Save company settings record to Supabase Database table 'company_settings'
 */
export async function saveCompanySettingsToSupabase(settings: CompanySettings): Promise<boolean> {
  if (!supabase) return false;

  try {
    const dbRow = {
      id: 'default',
      company_name: settings.companyName,
      owner_name: settings.ownerName,
      address: settings.address,
      whatsapp_number: settings.whatsappNumber,
      phone: settings.phone,
      ntn_number: settings.ntnNumber,
      dts_license: settings.dtsLicense,
      logo_url: settings.logoUrl || null,
      dashboard_banner_url: settings.dashboardBannerUrl || null,
      customer_portal_logo_url: settings.customerPortalLogoUrl || null,
      customer_portal_banner_url: settings.customerPortalBannerUrl || null,
      super_admin_avatar_url: settings.superAdminAvatarUrl || null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('company_settings')
      .upsert(dbRow, { onConflict: 'id' });

    if (error) {
      console.warn('Supabase database upsert warning:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to save settings to Supabase database:', err);
    return false;
  }
}

/**
 * Load company settings record from Supabase Database table 'company_settings'
 */
export async function fetchCompanySettingsFromSupabase(): Promise<CompanySettings | null> {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('company_settings')
      .select('*')
      .eq('id', 'default')
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return {
      companyName: data.company_name || 'KMZ Travels & Tours (Pvt) Ltd',
      ownerName: data.owner_name || 'Toheed Asghar Shahid',
      address: data.address || 'P-41 First Floor, Street 6/8, Jhung Bazar, Faisalabad',
      whatsappNumber: data.whatsapp_number || '03018647596',
      phone: data.phone || '03147861122',
      ntnNumber: data.ntn_number || 'NTN-7492018-9',
      dtsLicense: data.dts_license || 'DTS/FSD/2024/9912',
      logoUrl: data.logo_url || '',
      dashboardBannerUrl: data.dashboard_banner_url || '',
      customerPortalLogoUrl: data.customer_portal_logo_url || '',
      customerPortalBannerUrl: data.customer_portal_banner_url || '',
      superAdminAvatarUrl: data.super_admin_avatar_url || '',
    };
  } catch (err) {
    console.error('Failed to fetch settings from Supabase database:', err);
    return null;
  }
}

/**
 * Supabase Auth: Sign in with registered email and password
 */
export async function signInWithSupabaseAuth(email: string, password: string): Promise<{ success: boolean; user?: any; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'Supabase client is not initialized.' };
  }
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, user: data.user };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Authentication error' };
  }
}

/**
 * Supabase Auth: Sign out
 */
export async function signOutFromSupabaseAuth(): Promise<void> {
  if (!supabase) return;
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.warn('Supabase sign out error:', err);
  }
}

/**
 * Supabase Auth: Update user password
 */
export async function updateSupabaseUserPassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'Supabase client not initialized.' };
  }
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to update password in Supabase' };
  }
}

