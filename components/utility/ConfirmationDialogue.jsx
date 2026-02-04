import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';

const ConfirmationDialogue = ({ visible, onConfirm, onCancel, title, message }) => {
    return (
        <Modal transparent animationType="fade" visible={ visible }>
            <View style={ styles.overlay }>
                <View style={ styles.dialogueBox }>
                    <Text style={ styles.title }>{ title || 'Confirm Action' }</Text>
                    <Text style={ styles.message }>{ message || 'Are you sure you want to proceed?' }</Text>

                    <View style={ styles.buttonContainer }>
                        <TouchableOpacity style={ [ styles.button, styles.cancelButton ] } onPress={ onCancel }>
                            <Text style={ styles.cancelText }>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={ [ styles.button, styles.confirmButton ] } onPress={ onConfirm }>
                            <Text style={ styles.confirmText }>Confirm</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default ConfirmationDialogue;

// Styles
const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    dialogueBox: {
        width: 300,
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
        alignItems: 'center',
        elevation: 5,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    message: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    button: {
        flex: 1,
        padding: 10,
        alignItems: 'center',
        borderRadius: 5,
    },
    cancelButton: {
        backgroundColor: '#ccc',
        marginRight: 10,
    },
    confirmButton: {
        backgroundColor: '#007bff',
    },
    cancelText: {
        color: '#333',
        fontSize: 16,
    },
    confirmText: {
        color: '#fff',
        fontSize: 16,
    },
});




// import React, { useState } from 'react';
// import { View, Button } from 'react-native';
// import ConfirmationDialogue from './ConfirmationDialogue'; // Import the component

// const App = () => {
//   const [dialogueVisible, setDialogueVisible] = useState(false);

//   return (
//     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//       <Button title="Show Dialog" onPress={() => setDialogueVisible(true)} />

//       <ConfirmationDialogue
//         visible={dialogueVisible}
//         title="Delete Item"
//         message="Are you sure you want to delete this item?"
//         onConfirm={() => {
//           setDialogueVisible(false);
//           alert('Confirmed!');
//         }}
//         onCancel={() => setDialogueVisible(false)}
//       />
//     </View>
//   );
// };

// export default App;
