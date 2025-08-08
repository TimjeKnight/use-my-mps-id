// parliament.ts

import fetch from 'node-fetch';

export interface Representative {
  name: string;
  thumbnailUrl: string;
  partyName: string;
  constituencyName: string;
  id: number;
  dob: string;
  address1: string;
  address2: string;
  address3: string;
  address4: string;
  mockDriversLicenceLocation: string;
}

/**
 * Queries the Parliament API to find the MP ID for a given constituency name.
 * Returns the MP's ID as a number, or null if not found.
 */
export async function getMpByConstituency(constituencyName: string): Promise<Representative | null> {
  const encodedName = encodeURIComponent(constituencyName);
  const url = `https://members-api.parliament.uk/api/Location/Constituency/Search?searchText=${encodedName}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Parliament API responded with status ${response.status}`);
      return null;
    }

    const data = <any>await response.json();
    const result = data?.items?.[0];

    const member = result?.value?.currentRepresentation?.member?.value;
    const address = member?.latestAddress?.value;

    if (!member) return null;

    const representative: Representative = {
      id: member?.id ?? 0,
      name: member?.nameDisplayAs ?? '',
      thumbnailUrl: member?.thumbnailUrl ?? '',
      partyName: member?.latestParty?.name ?? '',
      constituencyName: constituencyName,
      dob: '07.10.1972',
      address1: address?.addressLine1 ?? '29 Bridge Street',
      address2: address?.addressLine2 ?? 'Bridge St',
      address3: address?.addressLine3 ?? '',
      address4: address?.postcode ?? 'SW1A 2JR',
      mockDriversLicenceLocation: ''
    };

    return representative;
  } catch (error) {
    console.error('Error fetching from Parliament API:', error);
    return null;
  }
}

/**
 * Returns a random MP from the Parliament API.
 */
export async function getRandomMember(): Promise<Representative | null> {
  // Parliament API has 650 current MPs, index range 0–649
  const skip = Math.floor(Math.random() * 650);
  const url = `https://members-api.parliament.uk/api/Members/Search?House=1&IsCurrentMember=true&skip=${skip}&take=1`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Parliament API responded with status ${response.status}`);
      return null;
    }

    const data = <any>await response.json();
    const member = data?.items?.[0]?.value;
    const address = member?.latestAddress?.value;

    if (!member) return null;

    const representative: Representative = {
      id: member?.id ?? 0,
      name: member?.nameDisplayAs ?? '',
      thumbnailUrl: member?.thumbnailUrl ?? '',
      partyName: member?.latestParty?.name ?? '',
      constituencyName: member?.latestHouseMembership?.membershipFrom ?? '',
      dob: '07.10.1972',
      address1: address?.addressLine1 ?? '29 Bridge Street',
      address2: address?.addressLine2 ?? 'Bridge St',
      address3: address?.addressLine3 ?? '',
      address4: address?.postcode ?? 'SW1A 2JR',
      mockDriversLicenceLocation: ''
    };

    return representative;
  } catch (error) {
    console.error('Error fetching random member from Parliament API:', error);
    return null;
  }
}
