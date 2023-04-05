import {BrowserRouter,Routes,Route} from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { AuthProvider } from "./context/auth";
import Main from "./components/nav/main";
import {Toaster} from "react-hot-toast";
import AccountActivate from "./pages/auth/activateAccount";
import ForgotPassword from "./pages/auth/forgotPassword"; 
import AccessAccount from "./pages/auth/accessAccount";
import Dashboard from "./pages/user/dashBoard";
import AdCreate from "./pages/user/ad/adCreate";
import PrivateRoute from "./components/routes/PrivateRoutes";
import SellHouse from "./pages/user/ad/SellHouse";
import SellLand from "./pages/user/ad/SellLand";
import RentHouse from "./pages/user/ad/RentHouse";
import RentLand from "./pages/user/ad/RentLand";
import Adview from "./pages/AdView";
import Footer from "./components/nav/footer";
import Profile from "./pages/user/Profile";
import Settings from "./pages/user/settings";
function App() {
  return (
    <BrowserRouter>
    <AuthProvider>
    <Main/>
    <Toaster/>
    <Routes>
      
      <Route path="/" element={<Home/>}/>
      <Route path="/login" element={<Login/>}/>
      <Route path="/register" element={<Register/>}/>
      <Route path="/auth/account-activate/:token" element={<AccountActivate/>}/>
      <Route path="/auth/forgot-password" element={<ForgotPassword/>}/>
      <Route path="/auth/access-account/:token" element={<AccessAccount/>}/>

      <Route path="/" element={<PrivateRoute/>}>
      <Route path="dashboard" element={<Dashboard/>}/>
      <Route path="ad/create" element={<AdCreate/>}/>
      <Route path="ad/create/sell/House" element={<SellHouse/>}/>
      <Route path="ad/create/sell/Land" element={<SellLand/>}/>
      <Route path="ad/create/rent/House" element={<RentHouse/>}/>
      <Route path="ad/create/rent/Land" element={<RentLand/>}/>
      <Route path="user/profile" element={<Profile/>}/>
      <Route path="user/settings" element={<Settings/>}/>
      </Route>

      <Route path="/ad/:slug" element={<Adview/>}/>
    </Routes>
    <Footer/>
    </AuthProvider>
    </BrowserRouter>
    
  );
}

export default App;
