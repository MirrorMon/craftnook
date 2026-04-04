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

export async function deleteImagesFromUrls(urls: (string | null)[]) {
  const supabase = createClient()
  
  // 1. 过滤无效值并提取文件名
  const fileNames = urls
    .filter((url): url is string => !!url && url.includes('craft-images'))
    .map(url => {
      const parts = url.split('/')
      const fileName = parts[parts.length - 1].split('?')[0]
      return decodeURIComponent(fileName)
    })

  if (fileNames.length === 0) return

  try {
    console.log('[Storage] Cleaning up images:', fileNames)
    const { error } = await supabase.storage
      .from('craft-images')
      .remove(fileNames)
      
    if (error) {
      console.error('[Storage] Cleanup error:', error.message)
    }
  } catch (err) {
    console.error('[Storage] Unexpected error during cleanup:', err)
  }
}
