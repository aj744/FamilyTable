import ContextDiagram from './pages/ContextDiagram';
import CookingMode from './pages/CookingMode';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import RecipeEditor from './pages/RecipeEditor';
import RecipeView from './pages/RecipeView';
import Search from './pages/Search';
import UnitConverter from './pages/UnitConverter';
import Meals from './pages/Meals';
import MealView from './pages/MealView';
import __Layout from './Layout.jsx';


export const PAGES = {
    "ContextDiagram": ContextDiagram,
    "CookingMode": CookingMode,
    "Dashboard": Dashboard,
    "Home": Home,
    "RecipeEditor": RecipeEditor,
    "RecipeView": RecipeView,
    "Search": Search,
    "UnitConverter": UnitConverter,
    "Meals": Meals,
    "MealView": MealView,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};