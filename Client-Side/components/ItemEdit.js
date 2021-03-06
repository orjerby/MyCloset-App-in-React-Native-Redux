import React from 'react';
import { StyleSheet, Text, View, Button, Image, Modal, ScrollView, KeyboardAvoidingView, TouchableOpacity, ImageBackground } from 'react-native';
import { connect } from 'react-redux';
import { deleteItem, editItem, getItem } from '../actions/index';
import CameraPage from './CameraPage';
import ImagePickerFromGallery from './ImagePickerFromGallery';
import { Isao } from 'react-native-textinput-effects';
import Button1 from 'apsl-react-native-button';
import FontAwesome, { Icons } from 'react-native-fontawesome';
import SectionedMultiSelect from 'react-native-sectioned-multi-select';

class ItemEdit extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isDisabled: false,
            selectedColors: [],
            selectedSeasons: [],
            selectedRates: [],
            selectedCategories: [],
            colorsItems: [],
            seasonsItems: [],
            ratesItems: [],
            categoriesItems: [],
            modalVisible: false,
            pic: "",
            tookPic: false,
            ItemMeasure: '',
            ItemCompany: '',
            ItemComment: ''
        };
    }

    edit = () => {
        const { selectedColors, selectedSeasons, selectedRates, selectedCategories, tookPic, ItemMeasure, ItemCompany, ItemComment } = this.state;
        const { ItemID, ItemImg } = this.props.item;
        const { UserID } = this.props.user;

        let SubcategoryID;
        let RateID;
        if (selectedCategories.length === 0) {
            alert('בחר קטגוריה');
            return;
        }
        if (selectedColors.length === 0) {
            alert('בחר צבע');
            return;
        }
        if (selectedSeasons.length === 0) {
            alert('בחר עונה');
            return;
        }
        if (selectedRates.length === 0) {
            alert('בחר דירוג');
            return;
        }

        SubcategoryID = selectedCategories[0];
        RateID = selectedRates[0];

        this.setState({ isDisabled: true });

        const paramsObj =
        {
            ItemID,
            Base64: tookPic ? this.state.pic.base64 : ItemImg,
            ItemImg: `${UserID}${new Date().valueOf()}.jpg`,
            OldItemImg: ItemImg,
            SubcategoryID,
            ColorIDArray: selectedColors,
            SeasonIDArray: selectedSeasons,
            RateID,
            ItemMeasure,
            ItemCompany,
            ItemComment
        };

        new Promise((finish) => {
            finish(this.props.editItem(paramsObj));
        })
            .then(() => {
                this.props.items.map(item => {
                    if (item.ItemID === ItemID) {
                        this.props.getItem(item);
                    }
                });
                this.props.navigation.navigate('ItemCard');
            });
    }

    componentDidMount() {
        const { item } = this.props;
        const { categories, colors, seasons, rates } = this.props.navigation.state.params;
        this.setState({ pic: item.ItemImg });

        let newColors = [];
        let newSeasons = [];
        let newRates = [];
        let newCategories = [];
        let dupArray = [];

        newColors = colors.map(Color => {
            return { name: Color.ColorName, id: Color.ColorID };
        });

        newSeasons = seasons.map(Season => {
            return { name: Season.SeasonName, id: Season.SeasonID };
        });

        newRates = rates.map(Rate => {
            return { name: Rate.RateName, id: Rate.RateID };
        });

        for (let i = 0, j = Number.MAX_SAFE_INTEGER; i < categories.length; i++ , j--) {
            let skip = false;
            let idIndex = categories[i].CategoryID;

            dupArray.forEach(dupArrayIndex => {
                if (dupArrayIndex === idIndex) {
                    skip = true;
                }
            });

            if (skip) {
                continue;
            }

            const currentCategory = categories.filter(x => x.CategoryID === idIndex)
            newCategories.push(
                {
                    name: currentCategory[0].CategoryName, id: j, children:
                        currentCategory.map(Category => {
                            return { name: Category.Subcategory.SubcategoryName, id: Category.Subcategory.SubcategoryID }
                        })
                }
            )

            dupArray.push(idIndex);
        }


        let selectedColors = item.ColorsOfItem.map(COI => {
            return COI.Color.ColorID
        });

        let selectedSeasons = item.SeasonsOfItem.map(SOI => {
            return SOI.Season.SeasonID
        });

        let selectedCategories = [];
        selectedCategories.push(item.Category.Subcategory.SubcategoryID);

        let selectedRates = [];
        selectedRates.push(item.Rate.RateID);


        this.setState({
            colorsItems: newColors,
            seasonsItems: newSeasons,
            categoriesItems: newCategories,
            ratesItems: newRates,
            selectedColors,
            selectedSeasons,
            selectedCategories,
            selectedRates,
            ItemMeasure: item.ItemMeasure,
            ItemCompany: item.ItemCompany,
            ItemComment: item.ItemComment
        });

    }

    delete = () => {
        const { ItemID, ItemImg } = this.props.item;
        this.setState({ isDisabled: true });

        const paramsObj =
        {
            ItemID,
            ItemImg
        };

        new Promise((finish) => {
            finish(this.props.deleteItem(paramsObj));
        })
            .then(() => {
                this.props.navigation.navigate('MyCloset', { previousRoute: this.props.navigation.state.routeName });
            });
    }

    onSelectedColorsChange = (selectedColors) => {
        this.setState({ selectedColors });
    }

    onSelectedSeasonsChange = (selectedSeasons) => {
        this.setState({ selectedSeasons });
    }

    onSelectedRatesChange = (selectedRates) => {
        if (this.state.selectedRates[0] === selectedRates[0]) {
            const rates = [];
            this.setState({ selectedRates: rates });
        } else {
            this.setState({ selectedRates });
        }
    }

    onSelectedCategoriesChange = (selectedCategories) => {
        if (this.state.selectedCategories[0] === selectedCategories[0]) {
            const categories = [];
            this.setState({ selectedCategories: categories });
        } else {
            this.setState({ selectedCategories });
        }
    }

    TakePicture = (pic) => {
        this.setState({ modalVisible: false, pic, tookPic: true })
    }

    renderPic = () => {

        const { ItemImg } = this.props.item;
        if (this.state.tookPic) {
            return <Image
                style={{ width: '100%', paddingTop: '100%', borderRadius: 10 }}
                source={{ uri: this.state.pic.uri }} />
        } else {
            if (ItemImg === "") {
                return <Image
                    style={{ width: '100%', paddingTop: '100%', borderRadius: 10 }}
                    source={{ uri: encodeURI("http://185.60.170.14/plesk-site-preview/ruppinmobile.ac.il/site05/images/defaultPic.jpg") }} />
            } else {
                return <Image
                    style={{ width: '100%', paddingTop: '100%', borderRadius: 10 }}
                    source={{ uri: encodeURI(ItemImg) }} />
            }
        }
    }

    render() {
        return (
            <ImageBackground
                style={{ width: '100%', height: '100%', flex: 1 }}
                source={{ uri: encodeURI("http://185.60.170.14/plesk-site-preview/ruppinmobile.ac.il/site05/images/wallPic4.jpg") }}>
                <View style={{ marginTop: 20 }}>
                    <KeyboardAvoidingView behavior="position" enabled>
                        <ScrollView>
                            <View style={{ display: 'flex', flexDirection: 'row-reverse' }}>
                                <TouchableOpacity onPress={() => { this.setState({ modalVisible: true }) }}>
                                    <FontAwesome style={{ fontSize: 50 }}>{Icons.camera}</FontAwesome>
                                </TouchableOpacity>

                                <ImagePickerFromGallery Snap={this.TakePicture} isDisabled={this.state.isDisabled} />
                            </View>

                            {this.renderPic()}

                            <SectionedMultiSelect
                                items={this.state.categoriesItems}
                                uniqueKey='id'
                                subKey='children'
                                selectText='בחר קטגוריה'
                                showDropDowns={true}
                                readOnlyHeadings={true}
                                alwaysShowSelectText={true}
                                onSelectedItemsChange={this.onSelectedCategoriesChange}
                                selectedItems={this.state.selectedCategories}
                                noResultsComponent={<Text>אין תוצאות</Text>}
                                confirmText='אשר'
                                searchPlaceholderText='חפש קטגוריה...'
                                styles={{ selectToggle: styles.selectToggle, chipText: styles.chipText }}
                            />

                            {this.state.selectedCategories.length === 0 ? <Text>{'\n\n'}</Text> : <View></View>}

                            <SectionedMultiSelect
                                items={this.state.colorsItems}
                                uniqueKey='id'
                                subKey='children'
                                selectText='בחר צבעים'
                                alwaysShowSelectText={true}
                                onSelectedItemsChange={this.onSelectedColorsChange}
                                selectedItems={this.state.selectedColors}
                                noResultsComponent={<Text>אין תוצאות</Text>}
                                confirmText='אשר'
                                searchPlaceholderText='חפש צבע...'
                                styles={{ selectToggle: styles.selectToggle, chipText: styles.chipText }}
                            />

                            {this.state.selectedColors.length === 0 ? <Text>{'\n\n'}</Text> : <View></View>}

                            <SectionedMultiSelect
                                items={this.state.seasonsItems}
                                uniqueKey='id'
                                subKey='children'
                                selectText='בחר עונות'
                                alwaysShowSelectText={true}
                                onSelectedItemsChange={this.onSelectedSeasonsChange}
                                selectedItems={this.state.selectedSeasons}
                                noResultsComponent={<Text>אין תוצאות</Text>}
                                confirmText='אשר'
                                searchPlaceholderText='חפש עונה...'
                                styles={{ selectToggle: styles.selectToggle, chipText: styles.chipText }}
                            />

                            {this.state.selectedSeasons.length === 0 ? <Text>{'\n\n'}</Text> : <View></View>}

                            <SectionedMultiSelect
                                items={this.state.ratesItems}
                                uniqueKey='id'
                                subKey='children'
                                selectText='בחר דירוג'
                                alwaysShowSelectText={true}
                                onSelectedItemsChange={this.onSelectedRatesChange}
                                selectedItems={this.state.selectedRates}
                                noResultsComponent={<Text>אין תוצאות</Text>}
                                confirmText='אשר'
                                searchPlaceholderText='חפש דירוג...'
                                styles={{ selectToggle: styles.selectToggle, chipText: styles.chipText }}
                            />

                            {this.state.selectedRates.length === 0 ? <Text>{'\n\n'}</Text> : <View></View>}

                            <Modal
                                animationType="slide"
                                transparent={false}
                                visible={this.state.modalVisible}
                                onRequestClose={() => null}
                            >
                                <Button
                                    title='Close'
                                    onPress={() => {
                                        this.setState({ modalVisible: false });
                                    }} />
                                <CameraPage Snap={this.TakePicture} />

                            </Modal>

                            <Isao
                                label={'מידה'}
                                activeColor={'#A0522D'}
                                passiveColor={'black'}
                                onChangeText={(ItemMeasure) => this.setState({ ItemMeasure })}
                                value={this.state.ItemMeasure}
                                maxLength={25}
                                inputStyle={{ color: '#696969' }}
                            />

                            <Isao
                                label={'חברה'}
                                activeColor={'#A0522D'}
                                passiveColor={'black'}
                                onChangeText={(ItemCompany) => this.setState({ ItemCompany })}
                                value={this.state.ItemCompany}
                                maxLength={25}
                                inputStyle={{ color: '#696969' }}
                            />

                            <Isao
                                label={'תיאור'}
                                activeColor={'#A0522D'}
                                passiveColor={'black'}
                                onChangeText={(ItemComment) => this.setState({ ItemComment })}
                                value={this.state.ItemComment}
                                maxLength={25}
                                inputStyle={{ color: '#696969' }}
                            />
                            <Text></Text>
                            <View style={{ margin: 10 }}>
                                <Button1 onPress={this.edit} isLoading={this.state.isDisabled} style={{ backgroundColor: '#c4c4c4' }} textStyle={{ fontSize: 18, fontWeight: 'bold' }}>
                                    עדכן</Button1>

                                <Button1 onPress={this.delete} isLoading={this.state.isDisabled} style={{ backgroundColor: '#c4c4c4' }} textStyle={{ fontSize: 18, fontWeight: 'bold' }}>
                                    מחק</Button1>
                            </View>

                        </ScrollView>
                    </KeyboardAvoidingView>

                </View>
            </ImageBackground>
        );
    }
}

function mapStateToProps({ item, user, items }) {
    return {
        item,
        user,
        items
    };
}

export default connect(mapStateToProps, { deleteItem, editItem, getItem })(ItemEdit);

const styles = StyleSheet.create({
    selectToggle: {
        backgroundColor: '#696969', padding: 5
    },
    chipText: {
        color: 'black'
    },
});
