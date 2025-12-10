import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import RecipeEditor from './pages/RecipeEditor';
import RecipeView from './pages/RecipeView';
import CookingMode from './pages/CookingMode';
import UnitConverter from './pages/UnitConverter';
import Search from './pages/Search';
import Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Dashboard": Dashboard,
    "RecipeEditor": RecipeEditor,
    "RecipeView": RecipeView,
    "CookingMode": CookingMode,
    "UnitConverter": UnitConverter,
    "Search": Search,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: Layout,
};