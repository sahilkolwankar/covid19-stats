import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { get, sortBy } from 'lodash';
import { RootState } from '../../app/store';
import { Country, CountryResponseData } from '../../types/index';

interface HomepageState {
    selectedCountries: string[];
    selectedCountry: string;
    summary: Country[];
    byCountry: {};
}

const initialState: HomepageState = {
    selectedCountries: [],
    selectedCountry: '',
    summary: [],
    byCountry: {},
};

export const homepageSlice = createSlice({
    name: 'homepage',
    initialState,
    reducers: {
        setSelectedCountries: (state, action: PayloadAction<string>) => {
            if (state.selectedCountries.includes(action.payload)) {
                state.selectedCountries = state.selectedCountries.filter((selectedCountry: string) => selectedCountry !== action.payload);
            } else {
                state.selectedCountries = [...state.selectedCountries, action.payload];
            }
        },
        setSelectedCountry: (state, action: PayloadAction<string>) => {
            state.selectedCountry = action.payload;
        },
        // Use the PayloadAction type to declare the contents of `action.payload`
        updateSummary: (state, action: PayloadAction<Object>) => {
            const summary = get(action, ['payload', 'summary']);
            state.summary = sortBy(summary, 'Country');
        },
        updateCountryData: (state, action: PayloadAction<{ countryCode: string, countryData: CountryResponseData[] }>) => {
            state.byCountry = {
                ...state.byCountry,
                [action.payload.countryCode]: action.payload.countryData,
            };
        },
    },
});

export const { setSelectedCountries, setSelectedCountry, updateCountryData, updateSummary } = homepageSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
export const selectHomepageSummary = (state: RootState) => state.homepage.summary;
export const selectByCountryData = (state: RootState) => state.homepage.byCountry;
export const selectSelectedCountry = (state: RootState) => state.homepage.selectedCountry;
export const selectSelectedCountries = (state: RootState) => state.homepage.selectedCountries;

export default homepageSlice.reducer;
