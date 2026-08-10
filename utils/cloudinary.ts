export async function uploadToCloudinary(fileUri: string, type: 'image' | 'video' | 'raw' = 'image', fileName?: string, mimeType?: string): Promise<string> {
  const CLOUD_NAME = 'fx6ulacf';
  const UPLOAD_PRESET = 'probation app';
  
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${type}/upload`;

  const formData = new FormData();
  
  const filename = fileName || fileUri.split('/').pop() || 'upload.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const ext = match?.[1] || 'jpg';
  
  // Cloudinary requires specific format for React Native FormData
  const fileObj = {
    uri: fileUri,
    type: mimeType || (type === 'image' ? `image/${ext}` : `application/${ext}`),
    name: filename,
  };

  formData.append('file', fileObj as any);
  formData.append('upload_preset', UPLOAD_PRESET);

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Cloudinary error: ${errorText}`);
    }
    
    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
}
