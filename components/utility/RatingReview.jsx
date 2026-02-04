import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

const RatingReview = () => {
    const [ rating, setRating ] = useState(0);
    const [ hover, setHover ] = useState(0); // Not needed in mobile
    const [ feedback, setFeedback ] = useState("");

    const handleRatingClick = (rate) => {
        setRating(rate);
    };

    const handleSubmit = () => {
        if (rating === 0) {
            Alert.alert("Validation", "Please select a rating before submitting.");
            return;
        }
        Alert.alert("Thank you!", `Rating: ${rating} ⭐\nFeedback: ${feedback}`);
    };

    return (
        <View style={ styles.container }>
            <Text style={ styles.title }>Rate and Review</Text>

            {/* Star Rating */ }
            <View style={ styles.stars }>
                { [ ...Array(5) ].map((_, index) => {
                    const starValue = index + 1;
                    return (
                        <TouchableOpacity key={ index } onPress={ () => handleRatingClick(starValue) }>
                            <FontAwesome
                                name={ starValue <= rating ? "star" : "star-o" }
                                size={ 30 }
                                color="#ffc107"
                                style={ { marginRight: 5 } }
                            />
                        </TouchableOpacity>
                    );
                }) }
            </View>

            {/* Feedback Input */ }
            <TextInput
                style={ styles.textarea }
                multiline
                numberOfLines={ 4 }
                placeholder="Write your feedback here..."
                value={ feedback }
                onChangeText={ setFeedback }
            />

            {/* Submit Button */ }
            <TouchableOpacity style={ styles.button } onPress={ handleSubmit }>
                <Text style={ styles.buttonText }>Submit Review</Text>
            </TouchableOpacity>
        </View>
    );
};

// Styles
const styles = StyleSheet.create({
    container: {
        padding: 20,
        margin: 20,
        borderRadius: 10,
        backgroundColor: "#fff",
        elevation: 4,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 15,
        textAlign: "center",
    },
    stars: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 20,
    },
    textarea: {
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 5,
        padding: 10,
        fontSize: 16,
        marginBottom: 20,
        textAlignVertical: "top",
    },
    button: {
        backgroundColor: "#28a745",
        paddingVertical: 12,
        borderRadius: 5,
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});

export default RatingReview;
// import React, { useState } from "react";
// import { FaStar } from "react-icons/fa";

// const RatingReview = () => {
//     const [ rating, setRating ] = useState(0);
//     const [ hover, setHover ] = useState(0);
//     const [ feedback, setFeedback ] = useState("");

//     const handleRatingClick = (rate) => {
//         setRating(rate);
//     };

//     const handleSubmit = () => {
//         if (rating === 0) {
//             alert("Please select a rating before submitting.");
//             return;
//         }
//         alert(`Thank you for your review!\nRating: ${rating} ⭐\nFeedback: ${feedback}`);
//     };

//     return (
//         <div style={ styles.container }>
//             <h2>Rate and Review</h2>

//             {/* Star Rating */ }
//             <div style={ styles.stars }>
//                 { [ ...Array(5) ].map((_, index) => {
//                     const starValue = index + 1;
//                     return (
//                         <FaStar
//                             key={ index }
//                             size={ 30 }
//                             color={ starValue <= (hover || rating) ? "#ffc107" : "#e4e5e9" }
//                             style={ { cursor: "pointer", marginRight: 5 } }
//                             onClick={ () => handleRatingClick(starValue) }
//                             onMouseEnter={ () => setHover(starValue) }
//                             onMouseLeave={ () => setHover(0) }
//                         />
//                     );
//                 }) }
//             </div>

//             {/* Feedback Input */ }
//             <textarea
//                 style={ styles.textarea }
//                 rows="4"
//                 placeholder="Write your feedback here..."
//                 value={ feedback }
//                 onChange={ (e) => setFeedback(e.target.value) }
//             />

//             {/* Submit Button */ }
//             <button style={ styles.button } onClick={ handleSubmit }>
//                 Submit Review
//             </button>
//         </div>
//     );
// };

// // Styles
// const styles = {
//     container: {
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         padding: "20px",
//         maxWidth: "400px",
//         margin: "auto",
//         border: "1px solid #ddd",
//         borderRadius: "10px",
//         boxShadow: "2px 2px 10px rgba(0,0,0,0.1)",
//         backgroundColor: "#fff",
//     },
//     stars: {
//         display: "flex",
//         marginBottom: "10px",
//     },
//     textarea: {
//         width: "100%",
//         padding: "10px",
//         borderRadius: "5px",
//         border: "1px solid #ccc",
//         marginBottom: "15px",
//         fontSize: "16px",
//     },
//     button: {
//         backgroundColor: "#28a745",
//         color: "#fff",
//         border: "none",
//         padding: "10px 20px",
//         fontSize: "16px",
//         borderRadius: "5px",
//         cursor: "pointer",
//     },
// };

// export default RatingReview;
