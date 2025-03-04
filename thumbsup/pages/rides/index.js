import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Footer from "../../components/Footer.jsx";
import Navbar from "../../components/Navbar.jsx";
import { useAuth } from '../../context/AuthContext';
import { collection, getDocs, doc, deleteDoc, addDoc, serverTimestamp, updateDoc } from "firebase/firestore"; 
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

const TableContainer = styled.div`
    background-color: lightgray;
    width: 80%;
    min-height: 40vh;
    border-radius: 8px;
    overflow: hidden;
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

const ActionButton = styled.button`
    background-color: #2e7d32;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 600;
    margin-right: 0.5rem;
    
    &:hover {
        background-color: #65b6d3;
    }
    
    &.delete {
        background-color: #ff6b6b;
        
        &:hover {
            background-color: #ff4f4f;
        }
    }
    
    &:disabled {
        background-color: #cccccc;
        cursor: not-allowed;
    }
`;

const Modal = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

const ModalContent = styled.div`
    background-color: white;
    padding: 2rem;
    border-radius: 8px;
    width: 90%;
    max-width: 500px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    
    h2 {
        margin: 0;
    }
`;

const CloseButton = styled.button`
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    
    &:hover {
        color: #777;
    }
`;

const RideDetails = styled.div`
    margin-bottom: 1.5rem;
    
    p {
        margin: 0.5rem 0;
    }
    
    .label {
        font-weight: bold;
        color: #555;
    }
`;

const TravelInfoCard = styled.div`
    background-color: #f0f8ff;
    border-radius: 4px;
    padding: 1rem;
    margin-bottom: 1.5rem;
    border-left: 4px solid #2e7d32;
`;

const FormGroup = styled.div`
    margin-bottom: 1.5rem;
`;

const Label = styled.label`
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
`;

const Input = styled.input`
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
    
    &:focus {
        outline: none;
        border-color: #2e7d32;
    }
`;

const ButtonContainer = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
`;

const SuccessMessage = styled.div`
    background-color: #d4edda;
    color: #155724;
    padding: 1rem;
    border-radius: 4px;
    margin-bottom: 1rem;
`;

const ErrorMessage = styled.div`
    background-color: #f8d7da;
    color: #721c24;
    padding: 1rem;
    border-radius: 4px;
    margin-bottom: 1rem;
`;

export default function Rides() {
    const { currentUser } = useAuth();
    const [rides, setRides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedRide, setSelectedRide] = useState(null);
    const [bookingSeats, setBookingSeats] = useState(1);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    async function fetchRides() { // fetching all rides from firestore
        const querySnapshot = await getDocs(collection(db, "rides"));
        const ridesArray = [];
        querySnapshot.forEach((doc) => {
            ridesArray.push({ id: doc.id, ...doc.data() });
        });
        console.log(ridesArray);
        return ridesArray;
    }
    
    useEffect(() => { // loading when the page loads
        async function loadRides() {
            try {
                const rideArray = await fetchRides();
                setRides(rideArray);
            } catch (error) {
                console.error("Error loading rides:", error);
            } finally {
                setLoading(false);
            }
        }
        loadRides();
    }, []);
    

    const handleRideClick = (ride) => {  // ride selection for viewing or booking
        setSelectedRide(ride);
        setShowModal(true);
        setBookingSeats(1); // Reset seats to 1 for new selection
        setMessage({ type: '', text: '' }); // Clear any previous messages
    };
    
    
    const handleCloseModal = () => { // Close the modal
        setShowModal(false);
        setSelectedRide(null);
    };
    
    const handleBookRide = async () => {
        if (!currentUser) { // checks if user is logged in
            setMessage({ 
                type: 'error', 
                text: 'You must be logged in to book a ride' 
            });
            return;
        }
        
        if (bookingSeats <= 0 || bookingSeats > selectedRide.seats) { // user tries to book more than available seats
            setMessage({ 
                type: 'error', 
                text: `Please select between 1 and ${selectedRide.seats} seats` 
            });
            return;
        }
        
        setIsSubmitting(true);
        
        try {
            // create booking document storing bookedSeats properly
            await addDoc(collection(db, "bookings"), {
                userId: currentUser.uid,
                userEmail: currentUser.email,
                rideId: selectedRide.id,
                bookedSeats: bookingSeats, // Store the number of seats this user booked
                totalPrice: (parseFloat(selectedRide.price) * bookingSeats).toFixed(2),
                bookingDate: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
                status: 'confirmed',
                createdAt: serverTimestamp(),
                estimatedDuration: selectedRide.estimatedDuration,
                estimatedDistance: selectedRide.estimatedDistance
            });
            
            // update the ride's available seats in Firestore
            const rideRef = doc(db, "rides", selectedRide.id);
            const updatedSeats = parseInt(selectedRide.seats) - bookingSeats;
            
            await updateDoc(rideRef, {
                seats: updatedSeats.toString() // update the available seats count
            });
            
            // update the ride in the local state to show reduced seat availability
            const updatedRides = rides.map(ride => {
                if (ride.id === selectedRide.id) {
                    return {
                        ...ride,
                        seats: updatedSeats
                    };
                }
                return ride;
            });
            
            setRides(updatedRides);
            
            // update the selectedRide with reduced seats
            setSelectedRide({
                ...selectedRide,
                seats: updatedSeats
            });
            
            setMessage({ 
                type: 'success', 
                text: `Successfully booked ${bookingSeats} seat(s) for your trip!` 
            });
            
            // reset booking seats to 1
            setBookingSeats(1);
        } catch (error) {
            console.error("Error booking ride:", error);
            setMessage({ 
                type: 'error', 
                text: 'An error occurred while booking the ride. Please try again.' 
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // deleting a ride
    const handleDeleteRide = async (rideId) => {
        if (!currentUser) {
            return;
        }
        
        if (window.confirm("Are you sure you want to delete this ride?")) {
            try {
                await deleteDoc(doc(db, "rides", rideId));
                
                // update rides list after deletion
                const updatedRides = rides.filter(ride => ride.id !== rideId);
                setRides(updatedRides);
                
                // close modal if the deleted ride was selected
                if (selectedRide && selectedRide.id === rideId) {
                    handleCloseModal();
                }
                
                alert("Ride deleted successfully!");
            } catch (error) {
                console.error("Error deleting ride:", error);
                alert("Failed to delete ride. Please try again.");
            }
        }
    };
    
    // check if the current user is the creator of a ride
    const isRideCreator = (ride) => {
        return currentUser && ride.createdBy === currentUser.uid;
    };
    
    return (
        <PageWrapper>
            <Navbar/>
            <ContentContainer>
                <h1>Available Rides</h1>
                <TableContainer>
                    {loading ? (
                        <p style={{ padding: '1rem', textAlign: 'center' }}>Loading rides...</p>
                    ) : rides.length === 0 ? (
                        <p style={{ padding: '1rem', textAlign: 'center' }}>No rides available at the moment.</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <tr>
                                    <TableHeaderCell>From → To</TableHeaderCell>
                                    <TableHeaderCell>Date & Time</TableHeaderCell>
                                    <TableHeaderCell>Est. Travel Time</TableHeaderCell>
                                    <TableHeaderCell>Available Seats</TableHeaderCell>
                                    <TableHeaderCell>Price</TableHeaderCell>
                                    <TableHeaderCell>Actions</TableHeaderCell>
                                </tr>
                            </TableHeader>
                            <TableBody>
                                {rides.map(ride => (
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
                                        <TableCell>
                                            <ActionButton onClick={() => handleRideClick(ride)}>
                                                View
                                            </ActionButton>
                                            {isRideCreator(ride) && (
                                                <ActionButton 
                                                    className="delete"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteRide(ride.id);
                                                    }}
                                                >
                                                    Delete
                                                </ActionButton>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </TableContainer>
                
                {showModal && selectedRide && (
                    <Modal onClick={handleCloseModal}>
                        <ModalContent onClick={(e) => e.stopPropagation()}>
                            <ModalHeader>
                                <h2>Ride Details</h2>
                                <CloseButton onClick={handleCloseModal}>&times;</CloseButton>
                            </ModalHeader>
                            
                            {message.text && (
                                <div>
                                    {message.type === 'success' ? (
                                        <SuccessMessage>{message.text}</SuccessMessage>
                                    ) : (
                                        <ErrorMessage>{message.text}</ErrorMessage>
                                    )}
                                </div>
                            )}
                            
                            <RideDetails>
                                <p>
                                    <span className="label">From:</span> {selectedRide.departureLocation}
                                </p>
                                <p>
                                    <span className="label">To:</span> {selectedRide.destination}
                                </p>
                                <p>
                                    <span className="label">Date:</span> {selectedRide.departureDate}
                                </p>
                                <p>
                                    <span className="label">Time:</span> {selectedRide.departureTime}
                                </p>
                                <p>
                                    <span className="label">Available Seats:</span> {selectedRide.seats}
                                </p>
                                <p>
                                    <span className="label">Price per Seat:</span> ${parseFloat(selectedRide.price).toFixed(2)}
                                </p>
                                {selectedRide.description && (
                                    <p>
                                        <span className="label">Additional Info:</span> {selectedRide.description}
                                    </p>
                                )}
                                <p>
                                    <span className="label">Posted by:</span> {selectedRide.creatorEmail || "Anonymous"}
                                </p>
                            </RideDetails>
                            {(selectedRide.estimatedDuration || selectedRide.estimatedDistance) && (
                                <TravelInfoCard>
                                    <h4 style={{ marginTop: 0, marginBottom: '0.5rem', color: '#2e7d32' }}>Travel Information</h4>
                                    {selectedRide.estimatedDistance && (
                                        <p>
                                            <span className="label">Distance:</span> {selectedRide.estimatedDistance}
                                        </p>
                                    )}
                                    {selectedRide.estimatedDuration && (
                                        <p>
                                            <span className="label">Estimated travel time:</span> {selectedRide.estimatedDuration}
                                        </p>
                                    )}
                                </TravelInfoCard>
                            )}
                            
                            {currentUser && selectedRide.seats > 0 && !isRideCreator(selectedRide) && (
                                <div>
                                    <FormGroup>
                                        <Label htmlFor="seats">How many seats would you like to book?</Label>
                                        <Input
                                            type="number"
                                            id="seats"
                                            min="1"
                                            max={selectedRide.seats}
                                            value={bookingSeats}
                                            onChange={(e) => setBookingSeats(parseInt(e.target.value))}
                                        />
                                    </FormGroup>
                                    
                                    <p>
                                        <span className="label">Total Price:</span> ${(parseFloat(selectedRide.price) * bookingSeats).toFixed(2)}
                                    </p>
                                    
                                    <ButtonContainer>
                                        <ActionButton 
                                            onClick={handleCloseModal}
                                        >
                                            Cancel
                                        </ActionButton>
                                        <ActionButton 
                                            onClick={handleBookRide}
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? 'Booking...' : 'Book Ride'}
                                        </ActionButton>
                                    </ButtonContainer>
                                </div>
                            )}
                            
                            {isRideCreator(selectedRide) && (
                                <ButtonContainer>
                                    <ActionButton 
                                        onClick={handleCloseModal}
                                    >
                                        Close
                                    </ActionButton>
                                    <ActionButton 
                                        className="delete"
                                        onClick={() => handleDeleteRide(selectedRide.id)}
                                    >
                                        Delete Ride
                                    </ActionButton>
                                </ButtonContainer>
                            )}
                            
                            {currentUser && selectedRide.seats === 0 && (
                                <p style={{ color: 'red', textAlign: 'center' }}>
                                    This ride is fully booked.
                                </p>
                            )}
                            
                            {!currentUser && (
                                <p style={{ textAlign: 'center' }}>
                                    Please log in to book this ride.
                                </p>
                            )}
                        </ModalContent>
                    </Modal>
                )}
            </ContentContainer>
            <Footer/>
        </PageWrapper>
    );
}