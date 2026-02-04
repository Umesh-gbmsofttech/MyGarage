// app/doItYourself/_layout.jsx

import { Stack } from 'expo-router';

export default function DoItYourselfLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={ { title: 'Do It Yourself' } } />
            {/* <Stack.Screen name="form/[id]" options={ { title: 'Vehicle Info' } } />
            <Stack.Screen name="details/[id]" options={ { title: 'Service Details' } } /> */}
        </Stack>
    );
}
