# Reset MySQL Root Password on Windows

## Method 1: Using MySQL Installer (Easiest)
1. Open "MySQL Installer" from Start Menu
2. Click "Reconfigure" on your MySQL Server
3. Follow the wizard and set a new password
4. Remember the new password!

## Method 2: Manual Reset
1. Stop MySQL service:
   ```
   net stop mysql80
   ```

2. Start MySQL in safe mode:
   ```
   "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe" --skip-grant-tables
   ```

3. In another terminal:
   ```
   "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root
   ```

4. Reset password:
   ```sql
   USE mysql;
   ALTER USER 'root'@'localhost' IDENTIFIED BY 'newpassword';
   FLUSH PRIVILEGES;
   EXIT;
   ```

5. Stop and restart MySQL service:
   ```
   net stop mysql80
   net start mysql80
   ```

## Method 3: Use MySQL Workbench
1. Open MySQL Workbench
2. Try connecting with different passwords
3. If it works, note the password

## After finding/resetting password:
1. Update your .env file with the correct password
2. Run: `node setup-db.js` 