import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Footer from "../../components/Footer.jsx";
import Navbar from "../../components/Navbar.jsx";
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, serverTimestamp, deleteDoc } from "firebase/firestore"; 
import { db } from '../../backend/config';

const PageWrapper = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    flex-grow: 0;
`;

const ContentContainer = styled.div`
    width: 100%;
    min-height: 60vh;
    background-color: white;
    color: black;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-sizing: border-box;
    padding: 2rem 0;
`;

const ProfileHeader = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 2rem;
`;

const ProfileAvatar = styled.div`
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background-color: #2e7d32;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 1rem;
    color: white;
    font-size: 2rem;
    font-weight: bold;
`;

const ProfileInfo = styled.div`
    text-align: center;
`;

const TabContainer = styled.div`
    display: flex;
    justify-content: center;
    margin-bottom: 2rem;
    width: 80%;
`;

const Tab = styled.button`
    padding: 0.75rem 1.5rem;
    background-color: ${props => props.active ? '#2e7d32' : '#f5f5f5'};
    color: ${props => props.active ? 'white' : '#333'};
    border: none;
    border-radius: 4px;
    margin: 0 0.5rem;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s;
    
    &:hover {
        background-color: ${props => props.active ? '#2e7d32' : '#e0e0e0'};
    }
`;

const TableContainer = styled.div`
    background-color: #f9f9f9;
    width: 80%;
    min-height: 40vh;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
`;

const TableHeader = styled.thead`
    background-color: #555;
    color: white;
`;

const TableHeaderCell = styled.th`
    padding: 1rem;
    text-align: left;
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
    border-bottom: 1px solid #ddd;
    
    &:nth-child(even) {
        background-color: #f2f2f2;
    }
    
    &:hover {
        background-color: #e0e0e0;
    }
`;

const TableCell = styled.td`
    padding: 1rem;
`;

const EmptyState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    text-align: center;
    color: #777;
`;

const ActionButton = styled.button`
    background-color: #2e7d32;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 600;
    transition: background-color 0.2s;
    
    &:hover {
        background-color: #65b6d3;
    }
    
    &.cancel {
        background-color: #ff6b6b;
        
        &:hover {
            background-color: #ff4f4f;
        }
    }
`;

const LoadingSpinner = styled.div`
    border: 5px solid #f3f3f3;
    border-top: 5px solid #2e7d32;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    animation: spin 1s linear infinite;
    margin: 2rem auto;
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

// for MODAL stuff
const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

const ModalContent = styled.div`
    background-color: white;
    width: 90%;
    max-width: 600px;
    border-radius: 8px;
    padding: 2rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    max-height: 90vh;
    overflow-y: auto;
`;

const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #eee;
`;

const ModalTitle = styled.h2`
    margin: 0;
    color: #333;
`;

const CloseButton = styled.button`
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #777;
    
    &:hover {
        color: #333;
    }
`;

const RideDetailRow = styled.div`
    display: flex;
    margin-bottom: 1rem;
`;

const RideDetailLabel = styled.div`
    flex: 0 0 150px;
    font-weight: 600;
    color: #555;
`;

const RideDetailValue = styled.div`
    flex: 1;
`;

const RideDetailSection = styled.div`
    margin-bottom: 2rem;
`;

const RideDetailSectionTitle = styled.h3`
    border-bottom: 1px solid #eee;
    padding-bottom: 0.5rem;
    margin-bottom: 1rem;
    color: #444;
`;

const TravelInfoSection = styled.div`
    background-color: #f0f8ff;
    border-radius: 4px;
    padding: 1rem;
    margin-bottom: 1.5rem;
    border-left: 4px solid #2e7d32;
`;

export default function Profile() {
    const { currentUser } = useAuth();
    const [activeTab, setActiveTab] = useState('booked');
    const [bookedRides, setBookedRides] = useState([]);
    const [postedRides, setPostedRides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedRide, setSelectedRide] = useState(null);
    
    // function to fetch booked rides
    async function fetchBookedRides() {
        try {
            // get only active (non-cancelled) bookings for the current user
            const bookingsQuery = query(
                collection(db, "bookings"), 
                where("userId", "==", currentUser.uid),
                where("status", "!=", "cancelled")
            );
            
            const bookingsSnapshot = await getDocs(bookingsQuery);
            const bookingsArray = [];
            
            for (const bookingDoc of bookingsSnapshot.docs) {
                const booking = {
                    bookingId: bookingDoc.id,
                    ...bookingDoc.data()
                };
                
                // Get the referenced ride using the rideId from the booking
                if (booking.rideId) {
                    const rideDocRef = doc(db, "rides", booking.rideId);
                    const rideDoc = await getDoc(rideDocRef);
                    
                    if (rideDoc.exists()) {
                        // combine booking and ride data
                        bookingsArray.push({
                            ...booking,
                            ...rideDoc.data(),
                            id: rideDoc.id
                        });
                    }
                }
            }
            
            console.log("Booked rides:", bookingsArray);
            return bookingsArray;
        } catch (error) {
            console.error("Error fetching booked rides:", error);
            return [];
        }
    }
    
    // fetch posted rides
    async function fetchPostedRides() {
        try {
            const ridesQuery = query(
                collection(db, "rides"),
                where("createdBy", "==", currentUser.uid)
            );
            
            const querySnapshot = await getDocs(ridesQuery);
            const ridesArray = [];
            
            querySnapshot.forEach((doc) => {
                ridesArray.push({ 
                    id: doc.id, 
                    ...doc.data() 
                });
            });
            
            console.log("Posted rides:", ridesArray);
            return ridesArray;
        } catch (error) {
            console.error("Error fetching posted rides:", error);
            return [];
        }
    }
    
    useEffect(() => {
        async function loadData() {
            if (!currentUser) return;
            
            setLoading(true);
            try {
                if (activeTab === 'booked') {
                    const bookings = await fetchBookedRides();
                    setBookedRides(bookings);
                } else {
                    const rides = await fetchPostedRides();
                    setPostedRides(rides);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        }
        
        loadData();
    }, [currentUser, activeTab]);

    // MODAL STUFF
    const handleRideClick = (ride) => {
        setSelectedRide(ride);
        setShowModal(true);
    };
    
    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedRide(null);
    };
    
    const handleCancelBooking = async (bookingId, rideId, bookedSeats) => {
        try {
            setLoading(true);
            
            // 1. we first update the booking status in Firestore
            const bookingRef = doc(db, "bookings", bookingId);
            await updateDoc(bookingRef, {
                status: "cancelled",
                canceledAt: serverTimestamp()
            });
            
            // 2. then update the available seats on the ride
            const rideRef = doc(db, "rides", rideId);
            const rideDoc = await getDoc(rideRef);
            
            if (rideDoc.exists()) {
                const rideData = rideDoc.data();
                // increase available seats by the number of cancelled seats
                const updatedSeats = Number(rideData.seats) + Number(bookedSeats);
                
                await updateDoc(rideRef, {
                    seats: updatedSeats.toString()
                });
            }
            
            // 3. refresh the bookings list
            const updatedBookings = await fetchBookedRides();
            setBookedRides(updatedBookings);
            
            // Close the modal if it's open
            if (showModal) {
                setShowModal(false);
                setSelectedRide(null);
            }
            
            console.log("Successfully canceled booking:", bookingId);
        } catch (error) {
            console.error("Error canceling booking:", error);
            alert("Failed to cancel booking. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // delete a ride posting
    const handleDeleteRide = async (rideId) => {
        try {
            setLoading(true);
            
            // find all bookings for this ride
            const bookingsQuery = query(
                collection(db, "bookings"),
                where("rideId", "==", rideId)
            );
            
            const bookingsSnapshot = await getDocs(bookingsQuery);
            
            // delete all associated bookings first
            const deletePromises = bookingsSnapshot.docs.map(bookingDoc => 
                deleteDoc(doc(db, "bookings", bookingDoc.id))
            );
            
            await Promise.all(deletePromises);
            
            // then delete the ride
            await deleteDoc(doc(db, "rides", rideId));
            
            // refresh the posted rides list
            const updatedRides = await fetchPostedRides();
            setPostedRides(updatedRides);
            
            // Close the modal if it's open
            if (showModal) {
                setShowModal(false);
                setSelectedRide(null);
            }
            
            alert("Ride deleted successfully!");
        } catch (error) {
            console.error("Error deleting ride:", error);
            alert("Failed to delete ride. Please try again.");
        } finally {
            setLoading(false);
        }
    };
    
    // get user initials for the profile
    const getUserInitials = () => {
        if (!currentUser || !currentUser.email) return "";
        
        const email = currentUser.email;
        const nameParts = email.split('@')[0].split('.');
        
        if (nameParts.length >= 2) {
            return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
        } else {
            return email.substring(0, 2).toUpperCase();
        }
    };
    
    if (!currentUser) {
        return (
            <PageWrapper>
                <Navbar/>
                <ContentContainer>
                    <h2>Please log in to view your profile</h2>
                </ContentContainer>
                <Footer/>
            </PageWrapper>
        );
    }
    
    return (
        <PageWrapper>
            <Navbar/>
            <ContentContainer>
                <ProfileHeader>
                    <ProfileAvatar>{getUserInitials()}</ProfileAvatar>
                    <ProfileInfo>
                        <h1>My Profile</h1>
                        <p>{currentUser.email}</p>
                    </ProfileInfo>
                </ProfileHeader>
                
                <TabContainer>
                    <Tab 
                        active={activeTab === 'booked'} 
                        onClick={() => setActiveTab('booked')}
                    >
                        My Booked Rides
                    </Tab>
                    <Tab 
                        active={activeTab === 'posted'} 
                        onClick={() => setActiveTab('posted')}
                    >
                        My Posted Rides
                    </Tab>
                </TabContainer>
                
                <TableContainer>
                    {loading ? (
                        <LoadingSpinner />
                    ) : activeTab === 'booked' ? (
                        bookedRides.length === 0 ? (
                            <EmptyState>
                                <h3>You haven't booked any rides yet</h3>
                                <p>Browse available rides and book your first trip!</p>
                            </EmptyState>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <tr>
                                        <TableHeaderCell>From → To</TableHeaderCell>
                                        <TableHeaderCell>Date & Time</TableHeaderCell>
                                        <TableHeaderCell>Est. Travel Time</TableHeaderCell>
                                        <TableHeaderCell>Booked Seats</TableHeaderCell>
                                        <TableHeaderCell>Price</TableHeaderCell>
                                        <TableHeaderCell>Actions</TableHeaderCell>
                                    </tr>
                                </TableHeader>
                                <TableBody>
                                    {bookedRides.map(ride => (
                                        <TableRow key={ride.bookingId}>
                                            <TableCell onClick={() => handleRideClick(ride)}>
                                                {ride.departureLocation} → {ride.destination}
                                            </TableCell>
                                            <TableCell onClick={() => handleRideClick(ride)}>
                                                {ride.departureDate} at {ride.departureTime}
                                            </TableCell>
                                            <TableCell onClick={() => handleRideClick(ride)}>
                                                {ride.estimatedDuration || 'Not available'}
                                            </TableCell>
                                            <TableCell onClick={() => handleRideClick(ride)}>
                                                {ride.bookedSeats || 1}
                                            </TableCell>
                                            <TableCell onClick={() => handleRideClick(ride)}>
                                                ${(parseFloat(ride.price) * (ride.bookedSeats || 1)).toFixed(2)}
                                            </TableCell>
                                            <TableCell>
                                                <ActionButton 
                                                    className="cancel"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleCancelBooking(ride.bookingId, ride.id, ride.bookedSeats || 1);
                                                    }}
                                                >
                                                    Cancel
                                                </ActionButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )
                    ) : (
                        postedRides.length === 0 ? (
                            <EmptyState>
                                <h3>You haven't posted any rides yet</h3>
                                <p>Share your journey with others by posting a ride!</p>
                            </EmptyState>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <tr>
                                        <TableHeaderCell>From → To</TableHeaderCell>
                                        <TableHeaderCell>Date & Time</TableHeaderCell>
                                        <TableHeaderCell>Est. Travel Time</TableHeaderCell>
                                        <TableHeaderCell>Available Seats</TableHeaderCell>
                                        <TableHeaderCell>Price</TableHeaderCell>
                                        <TableHeaderCell>Status</TableHeaderCell>
                                        <TableHeaderCell>Actions</TableHeaderCell>
                                    </tr>
                                </TableHeader>
                                <TableBody>
                                    {postedRides.map(ride => (
                                        <TableRow key={ride.id}>
                                            <TableCell onClick={() => handleRideClick(ride)}>
                                                {ride.departureLocation} → {ride.destination}
                                            </TableCell>
                                            <TableCell onClick={() => handleRideClick(ride)}>
                                                {ride.departureDate} at {ride.departureTime}
                                            </TableCell>
                                            <TableCell onClick={() => handleRideClick(ride)}>
                                                {ride.estimatedDuration || 'Not available'}
                                            </TableCell>
                                            <TableCell onClick={() => handleRideClick(ride)}>
                                                {ride.seats}
                                            </TableCell>
                                            <TableCell onClick={() => handleRideClick(ride)}>
                                                ${parseFloat(ride.price).toFixed(2)}
                                            </TableCell>
                                            <TableCell onClick={() => handleRideClick(ride)}>
                                                {ride.status || 'active'}
                                            </TableCell>
                                            <TableCell>
                                                <ActionButton 
                                                    className="cancel"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteRide(ride.id);
                                                    }}
                                                >
                                                    Delete
                                                </ActionButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )
                    )}
                </TableContainer>
                
                {showModal && selectedRide && (
                    <ModalOverlay onClick={handleCloseModal}>
                        <ModalContent onClick={(e) => e.stopPropagation()}>
                            <ModalHeader>
                                <ModalTitle>Ride Details</ModalTitle>
                                <CloseButton onClick={handleCloseModal}>&times;</CloseButton>
                            </ModalHeader>
                            
                            <RideDetailSection>
                                <RideDetailSectionTitle>Trip Information</RideDetailSectionTitle>
                                <RideDetailRow>
                                    <RideDetailLabel>From:</RideDetailLabel>
                                    <RideDetailValue>{selectedRide.departureLocation}</RideDetailValue>
                                </RideDetailRow>
                                <RideDetailRow>
                                    <RideDetailLabel>To:</RideDetailLabel>
                                    <RideDetailValue>{selectedRide.destination}</RideDetailValue>
                                </RideDetailRow>
                                <RideDetailRow>
                                    <RideDetailLabel>Date:</RideDetailLabel>
                                    <RideDetailValue>{selectedRide.departureDate}</RideDetailValue>
                                </RideDetailRow>
                                <RideDetailRow>
                                    <RideDetailLabel>Time:</RideDetailLabel>
                                    <RideDetailValue>{selectedRide.departureTime}</RideDetailValue>
                                </RideDetailRow>
                            </RideDetailSection>
                            
                            {(selectedRide.estimatedDuration || selectedRide.estimatedDistance) && (
                                <TravelInfoSection>
                                    <RideDetailSectionTitle>Travel Information</RideDetailSectionTitle>
                                    {selectedRide.estimatedDistance && (
                                        <RideDetailRow>
                                            <RideDetailLabel>Distance:</RideDetailLabel>
                                            <RideDetailValue>{selectedRide.estimatedDistance}</RideDetailValue>
                                        </RideDetailRow>
                                    )}
                                    {selectedRide.estimatedDuration && (
                                        <RideDetailRow>
                                            <RideDetailLabel>Est. Duration:</RideDetailLabel>
                                            <RideDetailValue>{selectedRide.estimatedDuration}</RideDetailValue>
                                        </RideDetailRow>
                                    )}
                                </TravelInfoSection>
                            )}
                            
                            <RideDetailSection>
                                <RideDetailSectionTitle>Pricing & Availability</RideDetailSectionTitle>
                                {activeTab === 'booked' ? (
                                    <>
                                        <RideDetailRow>
                                            <RideDetailLabel>Booked Seats:</RideDetailLabel>
                                            <RideDetailValue>{selectedRide.bookedSeats || 1}</RideDetailValue>
                                        </RideDetailRow>
                                        <RideDetailRow>
                                            <RideDetailLabel>Price per Seat:</RideDetailLabel>
                                            <RideDetailValue>${parseFloat(selectedRide.price).toFixed(2)}</RideDetailValue>
                                        </RideDetailRow>
                                        <RideDetailRow>
                                            <RideDetailLabel>Total Price:</RideDetailLabel>
                                            <RideDetailValue>${(parseFloat(selectedRide.price) * (selectedRide.bookedSeats || 1)).toFixed(2)}</RideDetailValue>
                                        </RideDetailRow>
                                    </>
                                ) : (
                                    <>
                                        <RideDetailRow>
                                            <RideDetailLabel>Available Seats:</RideDetailLabel>
                                            <RideDetailValue>{selectedRide.seats}</RideDetailValue>
                                        </RideDetailRow>
                                        <RideDetailRow>
                                            <RideDetailLabel>Price per Seat:</RideDetailLabel>
                                            <RideDetailValue>${parseFloat(selectedRide.price).toFixed(2)}</RideDetailValue>
                                        </RideDetailRow>
                                        <RideDetailRow>
                                            <RideDetailLabel>Status:</RideDetailLabel>
                                            <RideDetailValue>{selectedRide.status || 'active'}</RideDetailValue>
                                        </RideDetailRow>
                                    </>
                                )}
                            </RideDetailSection>
                            
                            {selectedRide.description && (
                                <RideDetailSection>
                                    <RideDetailSectionTitle>Additional Information</RideDetailSectionTitle>
                                    <RideDetailValue>{selectedRide.description}</RideDetailValue>
                                </RideDetailSection>
                            )}
                            
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                                {activeTab === 'booked' ? (
                                    <ActionButton 
                                        className="cancel"
                                        onClick={() => handleCancelBooking(selectedRide.bookingId, selectedRide.id, selectedRide.bookedSeats || 1)}
                                    >
                                        Cancel Booking
                                    </ActionButton>
                                ) : (
                                    <ActionButton 
                                        className="cancel"
                                        onClick={() => handleDeleteRide(selectedRide.id)}
                                    >
                                        Delete Ride
                                    </ActionButton>
                                )}
                            </div>
                        </ModalContent>
                    </ModalOverlay>
                )}
            </ContentContainer>
            <Footer/>
        </PageWrapper>
    );
}