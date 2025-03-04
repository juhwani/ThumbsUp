import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/router';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../backend/config';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import styled from 'styled-components';
import Script from 'next/script';

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const ContentContainer = styled.div`
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  width: 100%;
`;

const FormTitle = styled.h1`
  font-size: 2rem;
  margin-bottom: 2rem;
  color: #333;
  text-align: center;
`;

const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  max-width: 600px;
  margin: 0 auto;
  background-color: #f9f9f9;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #555;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  width: 100%;
  
  &:focus {
    outline: none;
    border-color: #2e7d32;
    box-shadow: 0 0 0 2px rgba(135, 206, 235, 0.2);
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #2e7d32;
    box-shadow: 0 0 0 2px rgba(135, 206, 235, 0.2);
  }
`;

const SubmitButton = styled.button`
  background-color: #2e7d32;
  color: white;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #65b6d3;
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const SuccessMessage = styled.div`
  background-color: #d4edda;
  color: #155724;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const ErrorMessage = styled.div`
  background-color: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const InfoMessage = styled.div`
  background-color: #e7f3fe;
  color: #0c5460;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LoadingSpinner = styled.div`
  border: 5px solid #f3f3f3;
  border-top: 5px solid #2e7d32;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin: 0 auto;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Auto Complete components
const LocationSearchInput = styled.div`
  position: relative;
`;

const SuggestionsList = styled.ul`
  position: absolute;
  z-index: 100;
  background-color: white;
  width: 104%;
  border: 1px solid #ddd;
  border-radius: 0 0 4px 4px;
  margin-top: 0;
  padding: 0;
  max-height: 200px;
  overflow-y: auto;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const SuggestionItem = styled.li`
  list-style: none;
  padding: 0.75rem;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  
  &:hover {
    background-color: #f9f9f9;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const TravelInfoCard = styled.div`
  background-color: #f0f8ff;
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  border-left: 4px solid #2e7d32;
`;

const TravelInfoItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const TravelInfoText = styled.span`
  font-size: 0.9rem;
  color: #333;
`;

const geocodeLocation = async (searchText) => { // Geocoding function using Photon API (OpenStreetMap-based)
  try {
    const response = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(searchText)}&limit=5`); // directly taken from the documentation
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data && data.features && data.features.length > 0) {
      return data.features.map(feature => {
        const properties = feature.properties;
        const coordinates = feature.geometry.coordinates;
        
        let displayParts = []; // Create a display name from the available properties
        
        
        if (properties.name) displayParts.push(properties.name); // Add name of the location if available
        
        // Add house number and street if available
        if (properties.housenumber && properties.street) {
          displayParts.push(`${properties.housenumber} ${properties.street}`);
        } else if (properties.street) {
          displayParts.push(properties.street);
        }
        
        // Add city, state, and country
        if (properties.city) displayParts.push(properties.city);
        if (properties.state) displayParts.push(properties.state);
        if (properties.country) displayParts.push(properties.country);
        
        const display_name = displayParts.length > 0 ? displayParts.join(', ') : // If we have only country or if nothing else is available, use the OSM string
                             (properties.osm_value && properties.osm_key ? 
                              `${properties.osm_value} ${properties.osm_key}` : 'Unknown location');
        
        return {
          display_name: display_name,
          lat: coordinates[1], // Photon returns [lon, lat]
          lon: coordinates[0],
          properties: properties   // Store all properties for debugging piurposes
        };
      });
    }
    return [];
    
  } catch (error) {
    console.error('Error with geocoding service:', error);
    return [];
  }
};

const PostRides = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  
  // Location search states
  const [departureSuggestions, setDepartureSuggestions] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [showDepartureSuggestions, setShowDepartureSuggestions] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
  const [departureSearchText, setDepartureSearchText] = useState('');
  const [destinationSearchText, setDestinationSearchText] = useState('');
  const [isSearchingDeparture, setIsSearchingDeparture] = useState(false);
  const [isSearchingDestination, setIsSearchingDestination] = useState(false);
  
  // Google Maps API states
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [calculatingRoute, setCalculatingRoute] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null);
  
  const [formData, setFormData] = useState({
    departureLocation: '',
    departureAddress: '',
    departureLat: '',
    departureLng: '',
    destination: '',
    destinationAddress: '',
    destinationLat: '',
    destinationLng: '',
    departureDate: '',
    departureTime: '',
    seats: '',
    price: '',
    description: '',
    estimatedDuration: '',
    estimatedDistance: '',
  });
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // loading inGOOGLE MAP api 
  const initGoogleMapsAPI = () => {
    if (typeof window !== 'undefined' && !window.google) {
      setGoogleMapsLoaded(false);
    } else {
      setGoogleMapsLoaded(true);
    }
  };
  
  useEffect(() => {
    initGoogleMapsAPI();
  }, []);
  
  const handleGoogleMapsLoaded = () => {
    setGoogleMapsLoaded(true);
  };
  
  // calculate route when both departure and destination are selected
  useEffect(() => {
    const calculateRoute = async () => {
      if (
        formData.departureLat && 
        formData.departureLng && 
        formData.destinationLat && 
        formData.destinationLng &&
        googleMapsLoaded
      ) {
        setCalculatingRoute(true);
        try {
          const directionsService = new google.maps.DirectionsService();
          
          const result = await directionsService.route({
            origin: new google.maps.LatLng(formData.departureLat, formData.departureLng),
            destination: new google.maps.LatLng(formData.destinationLat, formData.destinationLng),
            travelMode: google.maps.TravelMode.DRIVING,
          });
          
          if (result.routes && result.routes.length > 0) {
            const route = result.routes[0];
            const leg = route.legs[0];
            
            setRouteInfo({
              distance: leg.distance.text,
              duration: leg.duration.text,
              durationValue: leg.duration.value, // duration in seconds
            });
            
            setFormData(prev => ({
              ...prev,
              estimatedDuration: leg.duration.text,
              estimatedDistance: leg.distance.text,
            }));
          }
        } catch (error) {
          console.error('Error calculating route:', error);
          setError('Could not calculate route. Please try different locations.');
        } finally {
          setCalculatingRoute(false);
        }
      }
    };
    
    if (googleMapsLoaded) {
      calculateRoute();
    }
  }, [formData.departureLat, formData.departureLng, formData.destinationLat, formData.destinationLng, googleMapsLoaded]);
  
  useEffect(() => { // redirect if not authenticated
    if (!authLoading && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, authLoading, router]);
  
  const handleDepartureSearch = async (e) => {
    const searchText = e.target.value;
    setDepartureSearchText(searchText);
    
    
    setFormData(prev => ({ // clear form data when user is typing
      ...prev,
      departureLocation: '',
      departureAddress: '',
      departureLat: '',
      departureLng: '',
    }));
    
    // clear route info when changing locations
    setRouteInfo(null);
    
    if (searchText.length > 2) {
      setIsSearchingDeparture(true);
      
      // use timeout for delaying response
      clearTimeout(window.departureSearchTimeout);
      window.departureSearchTimeout = setTimeout(async () => {
        try {
          const data = await geocodeLocation(searchText);
          
          if (data.length > 0) {
            setDepartureSuggestions(data);
            setShowDepartureSuggestions(true);
          } else {
            // fallback options just in case API can't find anything
            setDepartureSuggestions([
              {display_name: "New York, NY, USA", lat: "40.7128", lon: "-74.0060"},
              {display_name: "Los Angeles, CA, USA", lat: "34.0522", lon: "-118.2437"},
              {display_name: "Chicago, IL, USA", lat: "41.8781", lon: "-87.6298"}
            ]);
            setShowDepartureSuggestions(true);
          }
        } catch (error) {
          console.error('Error searching for locations:', error);
          // fallbacks when error
          setDepartureSuggestions([
            {display_name: "New York, NY, USA", lat: "40.7128", lon: "-74.0060"},
            {display_name: "Los Angeles, CA, USA", lat: "34.0522", lon: "-118.2437"},
            {display_name: "Chicago, IL, USA", lat: "41.8781", lon: "-87.6298"}
          ]);
          setShowDepartureSuggestions(true);
        } finally {
          setIsSearchingDeparture(false);
        }
      }, 500);
    } else {
      setDepartureSuggestions([]);
      setShowDepartureSuggestions(false);
      setIsSearchingDeparture(false);
    }
  };
  
  // delayed responses for the searches for efficinecy
  const handleDestinationSearch = async (e) => {
    const searchText = e.target.value;
    setDestinationSearchText(searchText);
    
    // clear the form data when user is typing
    setFormData(prev => ({
      ...prev,
      destination: '',
      destinationAddress: '',
      destinationLat: '',
      destinationLng: '',
    }));
    
    // Clear route info when changing locations
    setRouteInfo(null);
    
    if (searchText.length > 2) {
      setIsSearchingDestination(true);
      
      clearTimeout(window.destinationSearchTimeout);
      window.destinationSearchTimeout = setTimeout(async () => {
        try {
          const data = await geocodeLocation(searchText);
          
          if (data.length > 0) {
            setDestinationSuggestions(data);
            setShowDestinationSuggestions(true);
          } else {
            // fallback same thing as above
            setDestinationSuggestions([
              {display_name: "San Francisco, CA, USA", lat: "37.7749", lon: "-122.4194"},
              {display_name: "Seattle, WA, USA", lat: "47.6062", lon: "-122.3321"},
              {display_name: "Boston, MA, USA", lat: "42.3601", lon: "-71.0589"}
            ]);
            setShowDestinationSuggestions(true);
          }
        } catch (error) {
          console.error('Error searching for locations:', error);
          setDestinationSuggestions([
            {display_name: "San Francisco, CA, USA", lat: "37.7749", lon: "-122.4194"},
            {display_name: "Seattle, WA, USA", lat: "47.6062", lon: "-122.3321"},
            {display_name: "Boston, MA, USA", lat: "42.3601", lon: "-71.0589"}
          ]);
          setShowDestinationSuggestions(true);
        } finally {
          setIsSearchingDestination(false);
        }
      }, 500);
    } else {
      setDestinationSuggestions([]);
      setShowDestinationSuggestions(false);
      setIsSearchingDestination(false);
    }
  };
  
  // select a departure location from suggestions
  const handleDepartureSelect = (suggestion) => {
    // updating form data
    setFormData(prev => ({
      ...prev,
      departureLocation: suggestion.display_name,
      departureAddress: suggestion.display_name,
      departureLat: suggestion.lat,
      departureLng: suggestion.lon,
    }));
    
    // then update the input field text
    setDepartureSearchText(suggestion.display_name);
    setShowDepartureSuggestions(false);
    // DEBUGGIN
    console.log("Selected departure:", suggestion.display_name);
  };
  
  // select a destination location from suggestions
  const handleDestinationSelect = (suggestion) => {
    // first update the form data
    setFormData(prev => ({
      ...prev,
      destination: suggestion.display_name,
      destinationAddress: suggestion.display_name,
      destinationLat: suggestion.lat,
      destinationLng: suggestion.lon,
    }));
    
    // then update the input field text
    setDestinationSearchText(suggestion.display_name);
    setShowDestinationSuggestions(false);
    
    // debug
    console.log("Selected destination:", suggestion.display_name);
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // need to check if both has the coordinates
    if (!formData.departureLat || !formData.destinationLat) {
      setError('Please select valid locations from the dropdown suggestions');
      return;
    }
    
    try {
      setIsSubmitting(true);
      const rideData = await addDoc(collection(db, "rides"), {
        departureLocation: formData.departureLocation,
        departureAddress: formData.departureAddress,
        departureLat: formData.departureLat,
        departureLng: formData.departureLng,
        destination: formData.destination,
        destinationAddress: formData.destinationAddress,
        destinationLat: formData.destinationLat,
        destinationLng: formData.destinationLng,
        departureDate: formData.departureDate,
        departureTime: formData.departureTime,
        seats: formData.seats,
        price: formData.price,
        description: formData.description,
        estimatedDuration: formData.estimatedDuration,
        estimatedDistance: formData.estimatedDistance,
        createdBy: currentUser.uid,
        creatorEmail: currentUser.email,
        createdAt: serverTimestamp(),
        status: 'active'
      });
      
      console.log('Form submitted:', rideData);
      
      setIsSubmitted(true);

      // reset form after a delay
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({
          departureLocation: '',
          departureAddress: '',
          departureLat: '',
          departureLng: '',
          destination: '',
          destinationAddress: '',
          destinationLat: '',
          destinationLng: '',
          departureDate: '',
          departureTime: '',
          seats: '',
          price: '',
          description: '',
          estimatedDuration: '',
          estimatedDistance: '',
        });
        
        setDepartureSearchText('');
        setDestinationSearchText('');
        setRouteInfo(null);
      }, 3000);
    } catch (error) {
      console.error("Error adding document: ", error);
      setError('Failed to post ride. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      // c heck if the click is outside of the sugestions list
      if (!event.target.closest('.suggestions-container')) {
        setShowDepartureSuggestions(false);
        setShowDestinationSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // show loading state while checking authentication
  if (authLoading) {
    return (
      <PageWrapper>
        <Navbar />
        <ContentContainer>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <LoadingSpinner />
          </div>
        </ContentContainer>
        <Footer />
      </PageWrapper>
    );
  }
  
  // Not authenticated
  if (!currentUser) {
    return null;
  }
  
  return (
    <PageWrapper>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        onLoad={handleGoogleMapsLoaded}
      />
      
      <Navbar />
      
      <ContentContainer>
        <FormTitle>Post a New Ride</FormTitle>
        
        <FormContainer onSubmit={handleSubmit}>
          {isSubmitted && (
            <SuccessMessage>
              Your ride has been posted successfully! 👍
            </SuccessMessage>
          )}
          
          {error && (
            <ErrorMessage>
              {error}
            </ErrorMessage>
          )}
          
          <FormGroup>
            <Label htmlFor="departureLocation">Departure Location</Label>
            <LocationSearchInput className="suggestions-container">
              <Input
                id="departureLocation"
                value={departureSearchText}
                onChange={handleDepartureSearch}
                placeholder="Enter departure address"
                autoComplete="off"
                required
              />
              {isSearchingDeparture && departureSearchText.length > 2 && (
                <div style={{ textAlign: 'center', padding: '10px' }}>
                  <LoadingSpinner style={{ width: '20px', height: '20px' }} />
                </div>
              )}
              {showDepartureSuggestions && departureSuggestions.length > 0 && (
                <SuggestionsList onClick={(e) => e.stopPropagation()}>
                  {departureSuggestions.map((suggestion, index) => (
                    <SuggestionItem
                      key={index}
                      onClick={() => handleDepartureSelect(suggestion)}
                    >
                      {suggestion.display_name}
                    </SuggestionItem>
                  ))}
                </SuggestionsList>
              )}
            </LocationSearchInput>
            {formData.departureLat && (
              <div style={{ fontSize: '0.8rem', color: 'green', marginTop: '0.5rem' }}>
                Location selected
              </div>
            )}
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="destination">Destination</Label>
            <LocationSearchInput className="suggestions-container">
              <Input
                id="destination"
                value={destinationSearchText}
                onChange={handleDestinationSearch}
                placeholder="Enter destination address"
                autoComplete="off"
                required
              />
              {isSearchingDestination && destinationSearchText.length > 2 && (
                <div style={{ textAlign: 'center', padding: '10px' }}>
                  <LoadingSpinner style={{ width: '20px', height: '20px' }} />
                </div>
              )}
              {showDestinationSuggestions && destinationSuggestions.length > 0 && (
                <SuggestionsList onClick={(e) => e.stopPropagation()}>
                  {destinationSuggestions.map((suggestion, index) => (
                    <SuggestionItem
                      key={index}
                      onClick={() => handleDestinationSelect(suggestion)}
                    >
                      {suggestion.display_name}
                    </SuggestionItem>
                  ))}
                </SuggestionsList>
              )}
            </LocationSearchInput>
            {formData.destinationLat && (
              <div style={{ fontSize: '0.8rem', color: 'green', marginTop: '0.5rem' }}>
                ✓ Location selected
              </div>
            )}
          </FormGroup>
          

          {calculatingRoute && (
            <InfoMessage>
              <LoadingSpinner style={{ width: '20px', height: '20px', marginRight: '10px' }} />
              Calculating route...
            </InfoMessage>
          )}
          
          {routeInfo && (
            <TravelInfoCard>
              <h4 style={{ marginTop: 0, marginBottom: '0.5rem', color: '#2e7d32' }}>Route Information</h4>
              <TravelInfoItem>

                <TravelInfoText><strong>Distance:</strong> {routeInfo.distance}</TravelInfoText>
              </TravelInfoItem>
              <TravelInfoItem>
                <TravelInfoText><strong>Estimated travel time:</strong> {routeInfo.duration}</TravelInfoText>
              </TravelInfoItem>
            </TravelInfoCard>
          )}
          
          <FormGroup>
            <Label htmlFor="departureDate">Departure Date</Label>
            <Input
              type="date"
              id="departureDate"
              name="departureDate"
              value={formData.departureDate}
              onChange={handleChange}
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="departureTime">Departure Time</Label>
            <Input
              type="time"
              id="departureTime"
              name="departureTime"
              value={formData.departureTime}
              onChange={handleChange}
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="seats">Available Seats</Label>
            <Input
              type="number"
              id="seats"
              name="seats"
              min="1"
              max="8"
              value={formData.seats}
              onChange={handleChange}
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="price">Price per Seat ($)</Label>
            <Input
              type="number"
              id="price"
              name="price"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="description">Additional Information</Label>
            <TextArea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Share details about luggage space, pets allowed, smoking policy, etc."
            />
          </FormGroup>
          
          <SubmitButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Posting...' : 'Post Ride'}
          </SubmitButton>
        </FormContainer>
      </ContentContainer>
      
      <Footer />
    </PageWrapper>
  );
};

export default PostRides;