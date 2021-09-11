enum GoogleSourceType {
  ACCOUNT = 'ACCOUNT',
  PROFILE = 'PROFILE'
}

interface GoogleSource {
  type: GoogleSourceType
  id: string
}

interface GoogleFieldMetadata {
  primary: boolean
  sourcePrimary?: boolean
  verified?: boolean
  source: GoogleSource
}

export interface GooglePersonResource {
  resourceName: string
  etag: string
  names: [
    {
      metadata: GoogleFieldMetadata
      displayName: string
      familyName: string
      givenName: string
      displayNameLastFirst: string
      unstructuredName: string
    }
  ]
  emailAddresses: [
    {
      metadata: GoogleFieldMetadata
      value: string
    }
  ]
}
