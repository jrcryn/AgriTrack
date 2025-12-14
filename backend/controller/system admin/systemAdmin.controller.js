export const register = async (req, res) => {
    const { first_name, last_name, middle_name, suffix, email, phone, roles, office_position } = req.body;
    
    let userId = null;
    
    try {
        const employee = await global.globalModels.EmployeeAccount.find({ $or: [{ email }, { phone }, { first_name }, { last_name }] });
        if (employee.length > 0) {
            await logAction(req, userId, 'USER_REGISTER', 'AUTHENTICATION', `Registration attempt failed - Employee already exists: ${email}`, 'VALIDATION_FAILED');
            return res.status(400).json({ success: false, message: 'Employee already exists.' });
        }

        if (!first_name || !last_name || !email || !phone || !roles || (roles.includes('DMS') && !office_position)) {
            await logAction(req, userId, 'USER_REGISTER', 'AUTHENTICATION', `Registration attempt failed - Missing required fields for email: ${email || 'unknown'}`, 'VALIDATION_FAILED');
            return res.status(400).json({ success: false, message: 'All fields are required.' });
        }
        const position = roles.includes('DMS') ? office_position : null;

        // naisip ko gawin lang valid for 12 hours yung default password, if failed to comply si user need bumalik kay IT to create a new one.
        // TO BE IMPLEMENTED:
        // const defaultPasswordExpiry = Date.now() + 12 * 60 * 60 * 1000;

        const defaultPassword = crypto.randomBytes(8).toString('hex'); 
        const hashedPassword = await bcrypt.hash(defaultPassword, 12);

        await sendWelcomeEmail(email, defaultPassword);
        const newEmployee = await global.globalModels.EmployeeAccount.create({
            first_name,
            last_name,
            middle_name,
            suffix,
            office_position: position,
            roles,
            email,
            phone,
            password: hashedPassword,
        });
        await newEmployee.save();
        
        userId = newEmployee._id;
        
        await logAction(req, userId, 'USER_REGISTER', 'SYSTEM ADMIN', `User registered: ${email}`, 'SUCCESS');

        res.status(201).json({ 
            message: 'User registered successfully', 
            success: true,
            user: {
                id: newEmployee._id,
                first_name,
                last_name,
                middle_name,
                suffix,
                roles,
                office_position
            } 
        }); 

    } catch (error) {
        if (error.code === 11000) {
            await logAction(req, userId, 'USER_REGISTER', 'SYSTEM ADMIN', `Registration failed - User already exists: ${req.body.email}`, 'FAILED');
            return res.status(400).json({ success: false, message: 'User already exists.' });
        }

        await logAction(req, userId, 'USER_REGISTER', 'SYSTEM ADMIN', `Registration error: ${error.message}`, 'FAILED');

        console.error('Error signing up:', error);
        return res.status(500).json({ success: false ,message: 'Internal server error.' });
    }
};



