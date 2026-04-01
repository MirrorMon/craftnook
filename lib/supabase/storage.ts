import { createClient } from './client'

export async function uploadImage(file: File): Promise<string | null> {
  const supabase = createClient()
  
  const fileExt = file.name.split('.').pop()
  const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
  
  try {
    const { error } = await supabase.storage
      .from('craft-images')
      .upload(fileName, file)
      
    if (error) {
      console.error('Upload error:', error.message)
      return null
    }
    
    const { data } = supabase.storage
      .from('craft-images')
      .getPublicUrl(fileName)
      
    return data.publicUrl
  } catch (err) {
    console.error('Unexpected error during upload:', err)
    return null
  }
}
