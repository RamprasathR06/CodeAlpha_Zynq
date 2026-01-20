// Node 22 has global fetch

async function verify() {
    const baseUrl = 'http://localhost:3002';
    const testUser = {
        username: 'testuser' + Date.now(),
        email: 'test' + Date.now() + '@example.com',
        age: 25,
        password: 'password123'
    };

    console.log('Testing Registration...');
    try {
        const regRes = await fetch(`${baseUrl}/api/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testUser)
        });
        const regData = await regRes.json();
        console.log('Registration Response:', regData);

        if (!regData.success) {
            console.error('Registration failed');
            return;
        }

        console.log('Testing Login...');
        const loginRes = await fetch(`${baseUrl}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: testUser.username,
                password: testUser.password
            })
        });
        const loginData = await loginRes.json();
        console.log('Login Response:', loginData);

        if (loginData.success) {
            console.log('Verification SUCCESSFUL');
        } else {
            console.error('Login failed');
        }
    } catch (err) {
        console.error('Error during verification:', err);
    }
}

verify();
