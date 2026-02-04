import { Stack } from 'expo-router';

export default function ProfileLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={ { title: 'My Profile' } } />
            {/* <Stack.Screen name="details" options={ { title: 'Details' } } /> */ }
        </Stack>
    );
}
